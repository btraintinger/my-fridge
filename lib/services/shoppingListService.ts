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
import type {
    Product,
    ShoppingListItem as ShoppingListItemType,
} from '../types'
import { runFirebaseAction, subscriptionErrorHandler } from './firebaseAction'
import { newItemPayload } from './fridgeService'
import {
    itemsCollection,
    shoppingItemDoc,
    shoppingListCollection,
} from './refs'
import { postNotify } from '../notificationsClient'

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
        (snap) => callback(snap.docs.map((d) => d.data())),
        subscriptionErrorHandler(onError)
    )
}

export async function addShoppingItem(
    fridgeId: string,
    userId: string,
    name: string
) {
    const result = await runFirebaseAction(() =>
        addDoc(shoppingListCollection(fridgeId), {
            name,
            userId,
            checked: false,
            createdAt: serverTimestamp(),
        })
    )
    postNotify('shopping-list-activity', {
        fridgeId,
        action: 'item_added',
        itemName: name,
    })
    return result
}

export async function toggleShoppingItem(
    fridgeId: string,
    itemId: string,
    currentChecked: boolean,
    itemName: string
) {
    const result = await runFirebaseAction(() =>
        updateDoc(shoppingItemDoc(fridgeId, itemId), {
            checked: !currentChecked,
        })
    )
    postNotify('shopping-list-activity', {
        fridgeId,
        action: 'item_checked',
        itemName,
    })
    return result
}

export async function deleteShoppingItem(
    fridgeId: string,
    itemId: string,
    itemName: string
) {
    const result = await runFirebaseAction(() =>
        deleteDoc(shoppingItemDoc(fridgeId, itemId))
    )
    postNotify('shopping-list-activity', {
        fridgeId,
        action: 'item_removed',
        itemName,
    })
    return result
}

export async function updateShoppingItemName(
    fridgeId: string,
    itemId: string,
    name: string
) {
    return runFirebaseAction(() =>
        updateDoc(shoppingItemDoc(fridgeId, itemId), { name })
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
