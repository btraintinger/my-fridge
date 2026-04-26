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
} from 'firebase/firestore'
import type { FirestoreError } from 'firebase/firestore'
import type {
    Fridge,
    FridgeItem,
    Product,
    ShoppingListItem as ShoppingListItemType,
} from '../types'
import { COLLECTIONS } from '../constants'
import { BaseService } from './base'

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
            (snapshot) => {
                const items = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as FridgeItem[]
                callback(items)
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
    async addItemToFridge(fridgeId: string, product: Product) {
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
                        product: product, // Ensure we store it under product key to match FridgeItem type
                        quantity: 1,
                        addedAt: serverTimestamp(),
                    }
                ),
            `Added ${product.product_name} to fridge`
        )
    }

    // Shopping List Operations
    async addShoppingItem(fridgeId: string, userId: string, name: string) {
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
        return this.handleAction(async () => {
            // Add to fridge items
            await addDoc(
                collection(
                    db,
                    COLLECTIONS.FRIDGES,
                    fridgeId,
                    COLLECTIONS.ITEMS
                ),
                {
                    product: product,
                    quantity: 1,
                    addedAt: serverTimestamp(),
                }
            )
            // Remove from shopping list
            await deleteDoc(
                doc(
                    db,
                    COLLECTIONS.FRIDGES,
                    fridgeId,
                    COLLECTIONS.SHOPPING_LIST,
                    itemId
                )
            )
        }, `Moved ${product.product_name} to fridge`)
    }

    async updateItemQuantity(fridgeId: string, itemId: string, quantity: number) {
        const normalizedQuantity = Math.floor(quantity)
        if (!Number.isFinite(normalizedQuantity) || normalizedQuantity < 1) {
            this.config?.notifyError('Quantity must be at least 1')
            return
        }

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
                return productDoc.data() as Product
            }
            return null
        } catch (error) {
            console.error('Error getting cached product:', error)
            return null
        }
    }

    async cacheProduct(barcode: string, product: Product) {
        try {
            await setDoc(doc(db, COLLECTIONS.PRODUCTS, barcode), product)
        } catch (error) {
            console.error('Error caching product:', error)
        }
    }
}

export const productService = new ProductService()
