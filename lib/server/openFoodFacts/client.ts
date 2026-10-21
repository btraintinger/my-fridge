import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs'

export const OFF_FIELDS = [
    'product_name',
    'product_name_en',
    'brands',
    'image_front_url',
    'nutriscore_grade',
    'allergens_from_ingredients',
    'allergens',
    'allergens_tags',
    'ingredients_text',
    'ingredients_text_en',
    'origins',
    'origins_en',
    'countries',
    'countries_en',
    'labels_tags',
    'categories_tags',
    'ingredients_analysis_tags',
    'nutriments',
    'ecoscore_grade',
    'quantity',
].join(',')

const REQUEST_TIMEOUT_MS = 9000
const MAX_ATTEMPTS = 2

const offFetch: typeof fetch = async (input, init) => {
    let lastError: unknown
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
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

export const off = new OpenFoodFacts(offFetch)
