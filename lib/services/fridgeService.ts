import { db } from '../firebase'
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    or,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore'
import type { FirestoreError } from 'firebase/firestore'
import type {
    Fridge,
    FridgeItem,
    Product,
    ShoppingListItem as ShoppingListItemType,
} from '../types'
import { COLLECTIONS } from '../constants'
import { enqueueOfflineMutation } from '../offlineQueue'
import { BaseService } from './base'
import { fetchProductByBarcode } from '../openFoodFacts'

function trackOfflineMutation(
    type: Parameters<typeof enqueueOfflineMutation>[0]['type'],
    payload: Record<string, unknown>,
    dedupeKey?: string
) {
    if (typeof navigator === 'undefined' || navigator.onLine) return

    enqueueOfflineMutation({ type, payload, dedupeKey })
}

class FridgeService extends BaseService {
    // Subscribe to all fridges user has access to
    subscribeToFridges(
        user: { uid: string; email: string | null },
        callback: (fridges: Fridge[]) => void,
        onError?: (error: FirestoreError) => void
    ) {
        const fridgesCollection = collection(db, COLLECTIONS.FRIDGES)
        const q = user.email
            ? query(
                  fridgesCollection,
                  or(
                      where('userId', '==', user.uid),
                      where('sharedWithEmails', 'array-contains', user.email)
                  )
              )
            : query(fridgesCollection, where('userId', '==', user.uid))

        return onSnapshot(
            q,
            (snap) => {
                const fridges = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as Fridge[]
                callback(fridges)
            },
            onError
        )
    }

    // Subscribe to a single fridge
    subscribeToFridge(
        id: string,
        callback: (fridge: Fridge | null) => void,
        onError?: (error: FirestoreError) => void
    ) {
        const docRef = doc(db, COLLECTIONS.FRIDGES, id)
        return onSnapshot(
            docRef,
            (docSnap) => {
                if (!docSnap.exists()) {
                    callback(null)
                    return
                }
                callback({ id: docSnap.id, ...docSnap.data() } as Fridge)
            },
            onError
        )
    }

    // Subscribe to items in a fridge
    subscribeToFridgeItems(
        fridgeId: string,
        callback: (items: FridgeItem[]) => void,
        orderByAddedAt: boolean = false,
        onError?: (error: FirestoreError) => void
    ) {
        const itemsCollection = collection(
            db,
            COLLECTIONS.FRIDGES,
            fridgeId,
            COLLECTIONS.ITEMS
        )
        const itemsQuery = orderByAddedAt
            ? query(itemsCollection, orderBy('addedAt', 'desc'))
            : query(itemsCollection)

        return onSnapshot(
            itemsQuery,
            async (snapshot) => {
                const itemsPromises = snapshot.docs.map(async (d) => {
                    const data = d.data()
                    let product = data.product

                    // Wenn wir nur die productId (normalisiertes Schema) haben, lade das Produkt via Join
                    if (!product && data.productId) {
                        product = await productService.getCachedProduct(data.productId)
                    }

                    return {
                        id: d.id,
                        ...data,
                        product,
                    } as FridgeItem
                })
                
                const items = await Promise.all(itemsPromises)
                
                // Gebe nur die Items zurück, deren Produkt erfolgreich geladen wurde
                callback(items.filter((item) => item.product))
            },
            onError
        )
    }

    // Subscribe to shopping list items
    subscribeToShoppingList(
        fridgeId: string,
        callback: (items: ShoppingListItemType[]) => void,
        onError?: (error: FirestoreError) => void
    ) {
        const q = query(
            collection(
                db,
                COLLECTIONS.FRIDGES,
                fridgeId,
                COLLECTIONS.SHOPPING_LIST
            ),
            orderBy('createdAt', 'desc')
        )

        return onSnapshot(
            q,
            (snap) => {
                const items = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as ShoppingListItemType[]
                callback(items)
            },
            onError
        )
    }

    // Create fridge
    async createFridge(userId: string, name: string) {
        if (!name.trim()) {
            this.config?.notifyError('Fridge name cannot be empty')
            return
        }
        trackOfflineMutation(
            'createFridge',
            { userId, name: name.trim() },
            `createFridge:${userId}:${name.trim().toLowerCase()}`
        )
        return this.handleAction(
            async () =>
                addDoc(collection(db, COLLECTIONS.FRIDGES), {
                    name: name.trim(),
                    userId,
                    createdAt: serverTimestamp(),
                }),
            `Fridge "${name}" created`
        )
    }

    // Share fridge
    async shareFridge(fridgeId: string, email: string) {
        if (!email.trim()) {
            this.config?.notifyError('Email cannot be empty')
            return
        }
        trackOfflineMutation(
            'shareFridge',
            { fridgeId, email: email.trim().toLowerCase() },
            `shareFridge:${fridgeId}:${email.trim().toLowerCase()}`
        )
        const docRef = doc(db, COLLECTIONS.FRIDGES, fridgeId)
        return this.handleAction(
            async () =>
                updateDoc(docRef, {
                    sharedWithEmails: arrayUnion(email.trim().toLowerCase()),
                }),
            `Successfully shared with ${email}`
        )
    }

    // Unshare fridge
    async unshareFridge(fridgeId: string, email: string) {
        trackOfflineMutation(
            'unshareFridge',
            { fridgeId, email: email.trim().toLowerCase() },
            `unshareFridge:${fridgeId}:${email.trim().toLowerCase()}`
        )
        const docRef = doc(db, COLLECTIONS.FRIDGES, fridgeId)
        return this.handleAction(
            async () =>
                updateDoc(docRef, {
                    sharedWithEmails: arrayRemove(email),
                }),
            `Access removed for ${email}`
        )
    }

    // Delete item from fridge
    async deleteItem(fridgeId: string, itemId: string) {
        trackOfflineMutation(
            'deleteItem',
            { fridgeId, itemId },
            `deleteItem:${fridgeId}:${itemId}`
        )
        return this.handleAction(
            async () =>
                deleteDoc(
                    doc(
                        db,
                        COLLECTIONS.FRIDGES,
                        fridgeId,
                        COLLECTIONS.ITEMS,
                        itemId
                    )
                ),
            'Item removed'
        )
    }

    // Add item to fridge
    async addItemToFridge(
        fridgeId: string, 
        product: Product,
        options: { quantity?: number; expiryDate?: string; notes?: string } = {}
    ) {
        trackOfflineMutation(
            'addItemToFridge',
            {
                fridgeId,
                product,
                options,
            },
            `addItemToFridge:${fridgeId}:${product.barcode}:${options.expiryDate || ''}:${options.notes || ''}`
        )
        return this.handleAction(
            async () =>
                addDoc(
                    collection(
                        db,
                        COLLECTIONS.FRIDGES,
                        fridgeId,
                        COLLECTIONS.ITEMS
                    ),
                    {
                        productId: product.barcode, // Normalisiertes Schema: Nur Referenz speichern
                        quantity: options.quantity || 1,
                        ...(options.expiryDate && { expiryDate: options.expiryDate }),
                        ...(options.notes && { notes: options.notes }),
                        addedAt: serverTimestamp(),
                    }
                ),
            `Added ${product.product_name} to fridge`
        )
    }

    // Shopping List Operations
    async addShoppingItem(fridgeId: string, userId: string, name: string) {
        trackOfflineMutation(
            'addShoppingItem',
            { fridgeId, userId, name: name.trim() },
            `addShoppingItem:${fridgeId}:${name.trim().toLowerCase()}`
        )
        return this.handleAction(
            async () =>
                addDoc(
                    collection(
                        db,
                        COLLECTIONS.FRIDGES,
                        fridgeId,
                        COLLECTIONS.SHOPPING_LIST
                    ),
                    {
                        name: name.trim(),
                        userId,
                        checked: false,
                        createdAt: serverTimestamp(),
                    }
                ),
            `Added ${name} to shopping list`
        )
    }

    async toggleShoppingItem(
        fridgeId: string,
        itemId: string,
        currentChecked: boolean
    ) {
        trackOfflineMutation(
            'toggleShoppingItem',
            { fridgeId, itemId, currentChecked: !currentChecked },
            `toggleShoppingItem:${fridgeId}:${itemId}`
        )
        return this.handleAction(async () =>
            updateDoc(
                doc(
                    db,
                    COLLECTIONS.FRIDGES,
                    fridgeId,
                    COLLECTIONS.SHOPPING_LIST,
                    itemId
                ),
                {
                    checked: !currentChecked,
                }
            )
        )
    }

    async deleteShoppingItem(fridgeId: string, itemId: string) {
        trackOfflineMutation(
            'deleteShoppingItem',
            { fridgeId, itemId },
            `deleteShoppingItem:${fridgeId}:${itemId}`
        )
        return this.handleAction(
            async () =>
                deleteDoc(
                    doc(
                        db,
                        COLLECTIONS.FRIDGES,
                        fridgeId,
                        COLLECTIONS.SHOPPING_LIST,
                        itemId
                    )
                ),
            'Item deleted'
        )
    }

    async moveShoppingItemToFridge(
        fridgeId: string,
        itemId: string,
        product: Product
    ) {
        trackOfflineMutation(
            'moveShoppingItemToFridge',
            { fridgeId, itemId, product },
            `moveShoppingItemToFridge:${fridgeId}:${itemId}`
        )
        return this.handleAction(async () => {
            try {
                const batch = writeBatch(db)

                // Ref for the new item in the fridge inventory
                const newItemRef = doc(
                    collection(
                        db,
                        COLLECTIONS.FRIDGES,
                        fridgeId,
                        COLLECTIONS.ITEMS
                    )
                )

                batch.set(newItemRef, {
                    productId: product.barcode, // Normalisiertes Schema
                    quantity: 1,
                    addedAt: serverTimestamp(),
                })

                // Ref for the item to remove from the shopping list
                const shoppingItemRef = doc(
                    db,
                    COLLECTIONS.FRIDGES,
                    fridgeId,
                    COLLECTIONS.SHOPPING_LIST,
                    itemId
                )

                batch.delete(shoppingItemRef)

                console.log(`[FridgeService] Executing batch write: Moving shopping item ${itemId} to fridge ${fridgeId}`)
                await batch.commit()
                console.log(`[FridgeService] Successfully moved shopping item ${itemId}`)
            } catch (error) {
                console.error(`[FridgeService] Failed to move shopping item ${itemId} to fridge ${fridgeId}:`, error)
                throw error
            }
        }, `Moved ${product.product_name} to fridge`)
    }

    async updateItemQuantity(fridgeId: string, itemId: string, quantity: number) {
        const normalizedQuantity = Math.floor(quantity)
        if (!Number.isFinite(normalizedQuantity) || normalizedQuantity < 1) {
            this.config?.notifyError('Quantity must be at least 1')
            return
        }

        trackOfflineMutation(
            'updateItemQuantity',
            { fridgeId, itemId, quantity: normalizedQuantity },
            `updateItemQuantity:${fridgeId}:${itemId}`
        )

        return this.handleAction(
            async () =>
                updateDoc(
                    doc(
                        db,
                        COLLECTIONS.FRIDGES,
                        fridgeId,
                        COLLECTIONS.ITEMS,
                        itemId
                    ),
                    { quantity: normalizedQuantity }
                ),
            'Quantity updated'
        )
    }
}

export const fridgeService = new FridgeService()

class ProductService extends BaseService {
    async getCachedProduct(barcode: string): Promise<Product | null> {
        try {
            const productDoc = await getDoc(
                doc(db, COLLECTIONS.PRODUCTS, barcode)
            )
            if (productDoc.exists()) {
                const data = productDoc.data()
                
                // Firestore timestamp zu Millisekunden
                const updatedAt = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : 0
                const ageInDays = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24)
                const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

                if (ageInDays > 30 && !isOffline) {
                    console.log(`[Cache Miss/Expired] Product ${barcode} is ${Math.round(ageInDays)} days old. Fetching fresh data...`)
                    const freshProduct = await fetchProductByBarcode(barcode)
                    if (freshProduct) {
                        await this.cacheProduct(barcode, freshProduct)
                        return freshProduct
                    } else {
                        console.log(`[Cache Fallback] API fetch failed for ${barcode}, using stale cache data.`)
                        const productData = { ...data }
                        delete (productData as { updatedAt?: unknown }).updatedAt
                        return productData as Product
                    }
                }

                if (ageInDays > 30) {
                    console.log(`[Cache Fallback] Product ${barcode} is stale but offline. Using local cache data.`)
                } else {
                    console.log(`[Cache Hit] Product ${barcode} is fresh (${ageInDays.toFixed(1)} days old).`)
                }
                const productData = { ...data }
                delete (productData as { updatedAt?: unknown }).updatedAt
                return productData as Product
            }
            
            console.log(`[Cache Miss] Product ${barcode} not found in DB cache.`)
            return null
        } catch (error) {
            console.error('Error getting cached product:', error)
            return null
        }
    }

    async cacheProduct(barcode: string, product: Product) {
        try {
            await setDoc(doc(db, COLLECTIONS.PRODUCTS, barcode), {
                ...product,
                updatedAt: serverTimestamp(),
            })
            console.log(`[Cache Write] Saved product ${barcode} to DB with fresh timestamp.`)
        } catch (error) {
            console.error('Error caching product:', error)
        }
    }
}

export const productService = new ProductService()
