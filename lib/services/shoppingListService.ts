import { db } from '../firebase'
import type { FirestoreError } from 'firebase/firestore'
import {
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore'
import type { Product, ShoppingListItem as ShoppingListItemType } from '../types'
import {
    mapSnapshot,
    runFirebaseAction,
    subscriptionErrorHandler,
} from './firebaseAction'
import { newItemPayload } from './fridgeService'
import {
    itemsCollection,
    shoppingItemDoc,
    shoppingListCollection,
} from './refs'

export function subscribeToShoppingList(
    fridgeId: string,
    callback: (items: ShoppingListItemType[]) => void,
    onError?: (error: FirestoreError) => void
) {
    const q = query(
        shoppingListCollection(fridgeId),
        orderBy('createdAt', 'desc')
    )

    return onSnapshot(
        q,
        (snap) => callback(mapSnapshot<ShoppingListItemType>(snap)),
        subscriptionErrorHandler(onError)
    )
}

export async function addShoppingItem(
    fridgeId: string,
    userId: string,
    name: string
) {
    return runFirebaseAction(() =>
        addDoc(shoppingListCollection(fridgeId), {
            name,
            userId,
            checked: false,
            createdAt: serverTimestamp(),
        })
    )
}

export async function toggleShoppingItem(
    fridgeId: string,
    itemId: string,
    currentChecked: boolean
) {
    return runFirebaseAction(() =>
        updateDoc(shoppingItemDoc(fridgeId, itemId), {
            checked: !currentChecked,
        })
    )
}

export async function deleteShoppingItem(fridgeId: string, itemId: string) {
    return runFirebaseAction(() =>
        deleteDoc(shoppingItemDoc(fridgeId, itemId))
    )
}

export async function moveShoppingItemToFridge(
    fridgeId: string,
    itemId: string,
    product: Product
) {
    return runFirebaseAction(async () => {
        const batch = writeBatch(db)
        batch.set(doc(itemsCollection(fridgeId)), newItemPayload(product))
        batch.delete(shoppingItemDoc(fridgeId, itemId))
        await batch.commit()
    }, `"${product.product_name}" in den Kühlschrank verschoben`)
}
