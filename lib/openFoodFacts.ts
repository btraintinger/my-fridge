import OpenFoodFactsApi from '@openfoodfacts/openfoodfacts-nodejs'
import { ProductSchema } from './schemas'

// Use the singleton instance if possible
const off = new OpenFoodFactsApi(fetch, { country: 'world' })

export async function fetchProductByBarcode(barcode: string) {
    try {
        const result = await off.getProductV3(barcode, { fields: ['all'] })

        if (!result.data) return null

        const state = result.data
        if (!('product' in state)) return null

        const p = state.product
        const nm = p.nutriments as unknown as
            | Record<string, number>
            | null
            | undefined

        const productData = {
            barcode,
            product_name: p.product_name,
            brands: p.brands,
            image_url: p.image_front_url,
            nutriscore_grade: p.nutriscore_grade,
            allergens: p.allergens_from_ingredients,
            ingredients: p.ingredients_text,
            nutriments: {
                energy_kcal: nm?.['energy-kcal_100g'],
                fat: nm?.fat_100g,
                carbohydrates: nm?.carbohydrates_100g,
                sugars: nm?.sugars_100g,
                proteins: nm?.proteins_100g,
                salt: nm?.salt_100g,
                fiber: nm?.fiber_100g,
            },
            ecoscore_grade: p.ecoscore_grade,
        }

        const validated = ProductSchema.safeParse(productData)
        if (!validated.success) {
            console.warn('Product validation failed:', validated.error)
            // Fallback to minimal data if possible, or return null
            return ProductSchema.parse({
                barcode,
                product_name: p.product_name || 'Unknown Product',
                nutriments: {},
            })
        }

        return validated.data
    } catch (error) {
        console.error(
            'Error fetching product from Open Food Facts on client:',
            error
        )
        return null
    }
}
