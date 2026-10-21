import {
    type FirestoreError,
    addDoc,
    deleteDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore'
import type {
    Product,
    ShoppingListItem as ShoppingListItemType,
} from '@/lib/types'
import { runFirebaseAction, subscriptionErrorHandler } from './firebaseAction'
import { saveItemToFridge } from './fridgeService'
import { shoppingItemDoc, shoppingListCollection } from './refs'
import { postNotify } from '@/lib/notificationsClient'

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
    name: string,
    options: { quantity?: number; unit?: string } = {}
) {
    const result = await runFirebaseAction(() =>
        addDoc(shoppingListCollection(fridgeId), {
            name,
            userId,
            checked: false,
            createdAt: serverTimestamp(),
            ...(options.quantity != null ? { quantity: options.quantity } : {}),
            ...(options.unit ? { unit: options.unit } : {}),
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

export async function updateShoppingItemDetails(
    fridgeId: string,
    itemId: string,
    details: { quantity?: number; unit?: string }
) {
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(details)) {
        if (value !== undefined) payload[key] = value
    }
    if (Object.keys(payload).length === 0) return
    return runFirebaseAction(() =>
        updateDoc(shoppingItemDoc(fridgeId, itemId), payload)
    )
}

export async function moveShoppingItemToFridge(
    fridgeId: string,
    itemId: string,
    product: Product
) {
    return runFirebaseAction(
        () => saveItemToFridge(fridgeId, product, {}, itemId),
        { key: 'toast.movedToFridge', values: { name: product.product_name } }
    )
}
