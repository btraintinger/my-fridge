import { NextResponse } from 'next/server'
import { OpenFoodFacts, type Product } from '@openfoodfacts/openfoodfacts-nodejs'
import { ProductSchema } from '@/lib/schemas'

type Nutriments = NonNullable<Product['nutriments']>
type NutrimentKey = Extract<keyof Nutriments, string>

const OFF_FIELDS = [
    'product_name',
    'brands',
    'image_front_url',
    'nutriscore_grade',
    'allergens_from_ingredients',
    'ingredients_text',
    'origins',
    'origins_en',
    'countries',
    'countries_en',
    'labels_tags',
    'categories_tags',
    'ingredients_analysis_tags',
    'nutriments',
    'ecoscore_grade',
].join(',')

const REQUEST_TIMEOUT_MS = 9000
const MAX_ATTEMPTS = 2

const offFetch: typeof fetch = async (input, init) => {
    let lastError: unknown
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const controller = new AbortController()
        const timeout = setTimeout(
            () => controller.abort(),
            REQUEST_TIMEOUT_MS
        )
        try {
            const res = await fetch(input, {
                ...init,
                cache: 'no-store',
                signal: controller.signal,
            })
            if (res.status >= 500 && attempt < MAX_ATTEMPTS - 1) continue
            return res
        } catch (error) {
            lastError = error
        } finally {
            clearTimeout(timeout)
        }
    }
    throw lastError ?? new Error('Open Food Facts request failed')
}

const off = new OpenFoodFacts(offFetch)

function hasTag(tags: string[], tag: string) {
    return tags.includes(tag)
}

function flagFromTags(tags: string[], positiveTag: string, negativeTag: string) {
    if (hasTag(tags, positiveTag)) return true
    if (hasTag(tags, negativeTag)) return false
    return null
}

function normalizeTags(tags: string[] | undefined): string[] {
    return Array.isArray(tags)
        ? tags.filter((tag): tag is string => typeof tag === 'string')
        : []
}

function readNutriment(
    nutriments: Nutriments,
    key: NutrimentKey
): number | undefined {
    const value = nutriments[key]
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : undefined
    }
    return undefined
}

function cleanLocalePrefix(tag: string) {
    return tag.includes(':') ? tag.split(':').slice(1).join(':') : tag
}

function normalizeOffString(value: string | undefined | null): string {
    if (typeof value !== 'string') return ''
    const trimmed = value.trim()
    if (!trimmed) return ''
    return trimmed.toLowerCase() === 'unknown' ? '-' : trimmed
}

function categorizeProduct(tags: string[], productName: string): string {
    const pName = productName.toLowerCase()
    const hasTag = (matches: string[]) =>
        tags.some(tag => matches.some(m => tag.includes(m)))

    if (hasTag(['frozen'])) return 'Tiefkühl'
    if (hasTag(['beverage', 'drink', 'water', 'juice', 'soda', 'beer', 'wine', 'alcohol'])) return 'Getränke'
    if (hasTag(['dairy', 'milk', 'cheese', 'yogurt', 'butter', 'cream'])) return 'Milchprodukte'
    if (hasTag(['meat', 'poultry', 'beef', 'pork', 'fish', 'seafood', 'sausage'])) return 'Fleisch & Fisch'
    if (hasTag(['snack', 'sweet', 'candy', 'chocolate', 'dessert', 'biscuit', 'cake', 'ice-cream'])) return 'Snacks & Süßes'
    if (hasTag(['vegetable', 'fruit', 'legume', 'plant-based-foods'])) return 'Gemüse & Obst'

    if (['milch', 'käse', 'joghurt', 'butter', 'sahne', 'quark'].some(w => pName.includes(w))) return 'Milchprodukte'
    if (['fleisch', 'wurst', 'schinken', 'fisch', 'lachs', 'huhn', 'rind', 'schwein'].some(w => pName.includes(w))) return 'Fleisch & Fisch'
    if (['gemüse', 'obst', 'apfel', 'banane', 'tomate', 'salat', 'kartoffel'].some(w => pName.includes(w))) return 'Gemüse & Obst'
    if (['schokolade', 'keks', 'chips', 'bonbon', 'eis', 'riegel'].some(w => pName.includes(w))) return 'Snacks & Süßes'
    if (['saft', 'wasser', 'cola', 'limo', 'bier', 'wein'].some(w => pName.includes(w))) return 'Getränke'
    if (['tiefkühl', 'pizza'].some(w => pName.includes(w))) return 'Tiefkühl'

    return 'Sonstiges'
}

export async function GET(
    _request: Request,
    context: { params: Promise<{ barcode: string }> }
) {
    try {
        const { barcode } = await context.params
        const normalizedBarcode = barcode.trim()

        if (!/^\d{8,14}$/.test(normalizedBarcode)) {
            return NextResponse.json({ product: null }, { status: 400 })
        }

        const { data, error } = await off.apiv2.client.GET(
            '/api/v2/product/{code}',
            {
                params: {
                    path: { code: normalizedBarcode },
                    query: { fields: OFF_FIELDS },
                },
            }
        )

        if (error) {
            console.error('Open Food Facts SDK error:', error)
            return NextResponse.json({ product: null }, { status: 502 })
        }

        if (!data || data.status === 0 || !('product' in data) || !data.product) {
            return NextResponse.json({ product: null })
        }

        const p = data.product as Product
        const nutriments: Nutriments = p.nutriments ?? {}
        const analysisTags = normalizeTags(p.ingredients_analysis_tags)
        const labelTags = normalizeTags(p.labels_tags)
        const catTags = normalizeTags(p.categories_tags)

        const productName = normalizeOffString(p.product_name)

        const productData = {
            barcode: normalizedBarcode,
            product_name: productName,
            brands: normalizeOffString(p.brands),
            image_url: normalizeOffString(p.image_front_url),
            nutriscore_grade: normalizeOffString(p.nutriscore_grade),
            allergens: normalizeOffString(p.allergens_from_ingredients),
            ingredients: normalizeOffString(p.ingredients_text),
            origin_country: normalizeOffString(p.origins || p.origins_en),
            sold_in_countries: normalizeOffString(
                p.countries || p.countries_en
            ),
            labels: labelTags.map(cleanLocalePrefix).slice(0, 8),
            dietary_flags: {
                vegan: flagFromTags(
                    analysisTags,
                    'en:vegan',
                    'en:non-vegan'
                ),
                vegetarian: flagFromTags(
                    analysisTags,
                    'en:vegetarian',
                    'en:non-vegetarian'
                ),
                palm_oil_free: flagFromTags(
                    analysisTags,
                    'en:palm-oil-free',
                    'en:contains-palm-oil'
                ),
            },
            nutriments: {
                energy_kcal: readNutriment(nutriments, 'energy-kcal_100g'),
                fat: readNutriment(nutriments, 'fat_100g'),
                saturated_fat: readNutriment(nutriments, 'saturated-fat_100g'),
                carbohydrates: readNutriment(nutriments, 'carbohydrates_100g'),
                sugars: readNutriment(nutriments, 'sugars_100g'),
                proteins: readNutriment(nutriments, 'proteins_100g'),
                salt: readNutriment(nutriments, 'salt_100g'),
                fiber: readNutriment(nutriments, 'fiber_100g'),
            },
            ecoscore_grade: normalizeOffString(p.ecoscore_grade),
            category: categorizeProduct(catTags, productName),
        }

        const validated = ProductSchema.safeParse(productData)
        if (validated.success) {
            return NextResponse.json({ product: validated.data })
        }

        const fallback = ProductSchema.parse({
            barcode: normalizedBarcode,
            product_name:
                typeof p.product_name === 'string' &&
                p.product_name &&
                p.product_name.toLowerCase() !== 'unknown'
                    ? p.product_name
                    : '-',
            nutriments: {},
        })

        return NextResponse.json({ product: fallback })
    } catch (error) {
        console.error('Open Food Facts proxy failed:', error)
        return NextResponse.json({ product: null }, { status: 502 })
    }
}
