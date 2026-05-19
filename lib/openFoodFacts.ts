import { ProductSchema } from './schemas'

export async function fetchProductByBarcode(barcode: string) {
    const trimmedBarcode = barcode.trim()
    if (!trimmedBarcode) return null

    try {
        const response = await fetch(
            `/api/openfoodfacts/${encodeURIComponent(trimmedBarcode)}`,
            {
                method: 'GET',
                cache: 'no-store',
            }
        )

        if (!response.ok) {
            console.error(
                'Error fetching product from internal OFF endpoint:',
                response.status
            )
            return null
        }

        const payload = (await response.json()) as { product?: unknown }
        const validated = ProductSchema.safeParse(payload.product)
        return validated.success ? validated.data : null
    } catch (error) {
        console.error('Error fetching product from app API:', error)
        return null
    }
}
