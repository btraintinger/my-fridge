import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { fetchProductByBarcode } from '../openFoodFacts'
import type { Product } from '../types'
import { productDoc } from './refs'

type CachedProductData = Product & { updatedAt?: { toMillis?: () => number } }

function stripUpdatedAt(data: CachedProductData): Product {
    const product = { ...data }
    delete (product as { updatedAt?: unknown }).updatedAt
    return product as Product
}

export async function getCachedProduct(
    barcode: string
): Promise<Product | null> {
    try {
        const snap = await getDoc(productDoc(barcode))
        if (!snap.exists()) {
            console.debug(
                `[Cache Miss] Product ${barcode} not found in DB cache.`
            )
            return null
        }

        const data = snap.data() as CachedProductData
        const updatedAt = data.updatedAt?.toMillis
            ? data.updatedAt.toMillis()
            : 0
        const ageInDays = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24)
        const isOffline =
            typeof navigator !== 'undefined' && !navigator.onLine

        if (ageInDays > 30 && !isOffline) {
            console.debug(
                `[Cache Miss/Expired] Product ${barcode} is ${Math.round(ageInDays)} days old. Fetching fresh data...`
            )
            const freshProduct = await fetchProductByBarcode(barcode)
            if (freshProduct) {
                await cacheProduct(barcode, freshProduct)
                return freshProduct
            }
            console.debug(
                `[Cache Fallback] API fetch failed for ${barcode}, using stale cache data.`
            )
            return stripUpdatedAt(data)
        }

        if (ageInDays > 30) {
            console.debug(
                `[Cache Fallback] Product ${barcode} is stale but offline. Using local cache data.`
            )
        } else {
            console.debug(
                `[Cache Hit] Product ${barcode} is fresh (${ageInDays.toFixed(1)} days old).`
            )
        }
        return stripUpdatedAt(data)
    } catch (error) {
        console.error('Error getting cached product:', error)
        return null
    }
}

export async function cacheProduct(barcode: string, product: Product) {
    try {
        await setDoc(productDoc(barcode), {
            ...product,
            updatedAt: serverTimestamp(),
        })
        console.debug(
            `[Cache Write] Saved product ${barcode} to DB with fresh timestamp.`
        )
    } catch (error) {
        console.error('Error caching product:', error)
    }
}
