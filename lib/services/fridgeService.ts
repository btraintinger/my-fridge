import type { FirestoreError } from 'firebase/firestore'
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    deleteDoc,
    onSnapshot,
    or,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore'
import type { Fridge, FridgeItem, Product } from '../types'
import {
    docWithId,
    mapSnapshot,
    runFirebaseAction,
    subscriptionErrorHandler,
} from './firebaseAction'
import { getCachedProduct } from './productService'
import {
    fridgeDoc,
    fridgesCollection,
    itemDoc,
    itemsCollection,
} from './refs'

export type NewItemOptions = {
    quantity?: number
    expiryDate?: string
    notes?: string
}

export function newItemPayload(product: Product, options: NewItemOptions = {}) {
    return {
        productId: product.barcode,
        quantity: options.quantity || 1,
        ...(options.expiryDate && { expiryDate: options.expiryDate }),
        ...(options.notes && { notes: options.notes }),
        addedAt: serverTimestamp(),
    }
}

export function subscribeToFridges(
    user: { uid: string; email: string | null },
    callback: (fridges: Fridge[]) => void,
    onError?: (error: FirestoreError) => void
) {
    const source = fridgesCollection()
    const q = user.email
        ? query(
              source,
              or(
                  where('userId', '==', user.uid),
                  where('sharedWithEmails', 'array-contains', user.email)
              )
          )
        : query(source, where('userId', '==', user.uid))

    return onSnapshot(
        q,
        (snap) => callback(mapSnapshot<Fridge>(snap)),
        subscriptionErrorHandler(onError)
    )
}

export function subscribeToFridge(
    id: string,
    callback: (fridge: Fridge | null) => void,
    onError?: (error: FirestoreError) => void
) {
    return onSnapshot(
        fridgeDoc(id),
        (snap) => callback(docWithId<Fridge>(snap)),
        subscriptionErrorHandler(onError)
    )
}

export function subscribeToFridgeItems(
    fridgeId: string,
    callback: (items: FridgeItem[]) => void,
    orderByAddedAt: boolean = false,
    onError?: (error: FirestoreError) => void
) {
    const source = itemsCollection(fridgeId)
    const itemsQuery = orderByAddedAt
        ? query(source, orderBy('addedAt', 'desc'))
        : query(source)

    return onSnapshot(
        itemsQuery,
        async (snapshot) => {
            const items = await Promise.all(
                snapshot.docs.map(async (d) => {
                    const data = d.data()
                    const product =
                        data.product ??
                        (data.productId
                            ? await getCachedProduct(data.productId)
                            : null)
                    return { id: d.id, ...data, product } as FridgeItem
                })
            )
            callback(items.filter((item) => item.product))
        },
        subscriptionErrorHandler(onError)
    )
}

export async function createFridge(userId: string, name: string) {
    return runFirebaseAction(() =>
        addDoc(fridgesCollection(), {
            name,
            userId,
            createdAt: serverTimestamp(),
        })
    )
}

export async function shareFridge(fridgeId: string, email: string) {
    return runFirebaseAction(
        () =>
            updateDoc(fridgeDoc(fridgeId), {
                sharedWithEmails: arrayUnion(email.toLowerCase()),
            }),
        `Erfolgreich mit ${email} geteilt`
    )
}

export async function unshareFridge(fridgeId: string, email: string) {
    return runFirebaseAction(
        () =>
            updateDoc(fridgeDoc(fridgeId), {
                sharedWithEmails: arrayRemove(email),
            }),
        `Zugriff für ${email} entfernt`
    )
}

export async function deleteItem(fridgeId: string, itemId: string) {
    return runFirebaseAction(
        () => deleteDoc(itemDoc(fridgeId, itemId)),
        'Produkt entfernt'
    )
}

export async function addItemToFridge(
    fridgeId: string,
    product: Product,
    options: NewItemOptions = {}
) {
    return runFirebaseAction(
        () =>
            addDoc(itemsCollection(fridgeId), newItemPayload(product, options)),
        `"${product.product_name}" hinzugefügt!`
    )
}

export async function updateItemQuantity(
    fridgeId: string,
    itemId: string,
    quantity: number
) {
    return runFirebaseAction(
        () => updateDoc(itemDoc(fridgeId, itemId), { quantity }),
        'Menge aktualisiert'
    )
}
