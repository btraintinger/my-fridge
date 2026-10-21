import { getDoc } from 'firebase/firestore'
import { fetchProductByBarcode } from '@/lib/products/openFoodFacts'
import type { Product } from '@/lib/types'
import { productDoc } from './refs'

const CACHE_TTL_DAYS = 30

// Reads the shared products cache, falling through to the server-side OFF
// route on miss or stale entries. The server is the only writer of
// `/products` (see firestore.rules), but we still issue Firestore reads on
// the client so the SDK's IndexedDB persistence layer keeps a local copy
// for offline scans.
export async function getProduct(barcode: string): Promise<Product | null> {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

    try {
        const snap = await getDoc(productDoc(barcode))
        if (snap.exists()) {
            const data = snap.data()
            const updatedAtMillis = data.updatedAt?.toMillis?.() ?? 0
            const ageInDays =
                (Date.now() - updatedAtMillis) / (1000 * 60 * 60 * 24)
            if (ageInDays <= CACHE_TTL_DAYS || isOffline) {
                return data
            }
            const fresh = await fetchProductByBarcode(barcode)
            return fresh ?? data
        }
    } catch (error) {
        console.debug('Product cache read failed:', error)
    }

    if (isOffline) return null

    const fresh = await fetchProductByBarcode(barcode)
    if (fresh) {
        // Re-read so the freshly written server doc lands in IndexedDB and
        // becomes available for future offline scans.
        try {
            await getDoc(productDoc(barcode))
        } catch {
            // best-effort
        }
    }
    return fresh
}
