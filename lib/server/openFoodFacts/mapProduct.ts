import type { Product } from '@openfoodfacts/openfoodfacts-nodejs'
import { ProductSchema } from '@/lib/schemas'
import { categorizeProduct } from '@/lib/products/productCategorization'

type Nutriments = NonNullable<Product['nutriments']>
type NutrimentKey = Extract<keyof Nutriments, string>

function hasTag(tags: string[], tag: string) {
    return tags.includes(tag)
}

function flagFromTags(
    tags: string[],
    positiveTag: string,
    negativeTag: string
) {
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

function preferEnglishText(
    english: string | undefined,
    original: string | undefined
): string {
    const preferred = normalizeOffString(english)
    return preferred && preferred !== '-'
        ? preferred
        : normalizeOffString(original)
}

export function mapOffProduct(p: Product, normalizedBarcode: string) {
    const nutriments: Nutriments = p.nutriments ?? {}
    const analysisTags = normalizeTags(p.ingredients_analysis_tags)
    const labelTags = normalizeTags(p.labels_tags)
    const catTags = normalizeTags(p.categories_tags)

    const productName = preferEnglishText(p.product_name_en, p.product_name)

    const rawUnit =
        typeof (p as Record<string, unknown>).quantity === 'string'
            ? ((p as Record<string, unknown>).quantity as string).trim()
            : undefined

    const productData = {
        barcode: normalizedBarcode,
        product_name: productName,
        ...(rawUnit ? { unit: rawUnit } : {}),
        brands: normalizeOffString(p.brands),
        image_url: normalizeOffString(p.image_front_url),
        nutriscore_grade: normalizeOffString(p.nutriscore_grade),
        allergens: [
            ...normalizeTags(p.allergens_tags),
            normalizeOffString(p.allergens),
            normalizeOffString(p.allergens_from_ingredients),
        ]
            .filter((value) => value && value !== '-')
            .join(','),
        ingredients: preferEnglishText(
            p.ingredients_text_en,
            p.ingredients_text
        ),
        origin_country: normalizeOffString(p.origins_en || p.origins),
        sold_in_countries: normalizeOffString(p.countries_en || p.countries),
        labels: labelTags.map(cleanLocalePrefix).slice(0, 8),
        dietary_flags: {
            vegan: flagFromTags(analysisTags, 'en:vegan', 'en:non-vegan'),
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
        category: categorizeProduct(catTags),
    }

    const validated = ProductSchema.safeParse(productData)
    if (validated.success) {
        return validated.data
    }

    const fallback = ProductSchema.parse({
        barcode: normalizedBarcode,
        product_name: productName || '-',
        nutriments: {},
    })

    return fallback
}
