import { NextResponse } from 'next/server'
import { ProductSchema } from '@/lib/schemas'

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
    'ingredients_analysis_tags',
    'nutriments',
    'ecoscore_grade',
].join(',')

function hasTag(tags: string[], tag: string) {
    return tags.includes(tag)
}

function flagFromTags(tags: string[], positiveTag: string, negativeTag: string) {
    if (hasTag(tags, positiveTag)) return true
    if (hasTag(tags, negativeTag)) return false
    return null
}

function normalizeTags(tags: unknown): string[] {
    return Array.isArray(tags)
        ? tags.filter((t): t is string => typeof t === 'string')
        : []
}

function cleanLocalePrefix(tag: string) {
    return tag.includes(':') ? tag.split(':').slice(1).join(':') : tag
}

function normalizeUnknownString(value: unknown) {
    if (typeof value !== 'string') return ''
    const trimmed = value.trim()
    if (!trimmed) return ''
    return trimmed.toLowerCase() === 'unknown' ? '-' : trimmed
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        return await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                Accept: 'application/json',
                'User-Agent': 'my-fridge/0.1 (+https://github.com/btraintinger/my-fridge)',
            },
            signal: controller.signal,
        })
    } finally {
        clearTimeout(timeout)
    }
}

async function fetchOffProduct(barcode: string) {
    const endpoint = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${OFF_FIELDS}`

    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            const res = await fetchWithTimeout(endpoint, 9000)
            if (!res.ok) {
                if (res.status >= 500 && attempt === 0) continue
                return null
            }
            return (await res.json()) as Record<string, unknown>
        } catch (error) {
            if (attempt === 1) throw error
        }
    }

    return null
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

        const payload = await fetchOffProduct(normalizedBarcode)
        if (!payload || typeof payload !== 'object') {
            return NextResponse.json({ product: null })
        }

        const status = payload.status
        if (status === 0 || !(payload as { product?: unknown }).product) {
            return NextResponse.json({ product: null })
        }

        const p = (payload as { product: Record<string, unknown> }).product
        const nutriments =
            (p.nutriments as Record<string, number | undefined> | undefined) ??
            {}
        const analysisTags = normalizeTags(p.ingredients_analysis_tags)
        const labelTags = normalizeTags(p.labels_tags)

        const productData = {
            barcode: normalizedBarcode,
            product_name: normalizeUnknownString(p.product_name),
            brands: normalizeUnknownString(p.brands),
            image_url: normalizeUnknownString(p.image_front_url),
            nutriscore_grade: normalizeUnknownString(p.nutriscore_grade),
            allergens: normalizeUnknownString(p.allergens_from_ingredients),
            ingredients: normalizeUnknownString(p.ingredients_text),
            origin_country: normalizeUnknownString(p.origins || p.origins_en),
            sold_in_countries: normalizeUnknownString(
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
                energy_kcal: nutriments['energy-kcal_100g'],
                fat: nutriments.fat_100g,
                saturated_fat: nutriments['saturated-fat_100g'],
                carbohydrates: nutriments.carbohydrates_100g,
                sugars: nutriments.sugars_100g,
                proteins: nutriments.proteins_100g,
                salt: nutriments.salt_100g,
                fiber: nutriments.fiber_100g,
            },
            ecoscore_grade: normalizeUnknownString(p.ecoscore_grade),
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
