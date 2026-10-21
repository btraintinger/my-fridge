import { FieldValue } from 'firebase-admin/firestore'
import type { Product as CachedProduct } from '@/lib/schemas'
import { productAdminDoc } from '@/lib/services/refs.server'

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// Write the canonical OFF result to the shared cache via admin SDK. Clients
// are read-only on /products (see firestore.rules), which prevents cache
// poisoning from a malicious authenticated user.
export async function writeProductCache(
    barcode: string,
    product: CachedProduct
) {
    try {
        await productAdminDoc(barcode).set({
            ...product,
            updatedAt: FieldValue.serverTimestamp(),
        })
    } catch (error) {
        console.error('Failed to write product cache:', error)
    }
}

// Return the cached product if it exists and is fresh, otherwise null.
export async function readFreshProductCache(
    barcode: string
): Promise<CachedProduct | null> {
    try {
        const snap = await productAdminDoc(barcode).get()
        const data = snap.data()
        if (!data) return null
        const updatedAtMillis = data.updatedAt?.toMillis?.() ?? 0
        if (Date.now() - updatedAtMillis > CACHE_TTL_MS) return null
        return data
    } catch (error) {
        console.error('Failed to read product cache:', error)
        return null
    }
}
