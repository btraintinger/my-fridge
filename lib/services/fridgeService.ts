import type { FirestoreError } from 'firebase/firestore'
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    deleteDoc,
    getDocs,
    onSnapshot,
    or,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
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
import { postNotify } from '../notificationsClient'

export type NewItemOptions = {
    quantity?: number
    unit?: string
    expiryDate?: string
    notes?: string
}

export function newItemPayload(product: Product, options: NewItemOptions = {}) {
    const unit = options.unit ?? product.unit
    return {
        productId: product.barcode,
        quantity: options.quantity || 1,
        ...(unit ? { unit } : {}),
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

export async function deleteFridge(fridgeId: string) {
    const itemsSnapshot = await getDocs(itemsCollection(fridgeId))
    return runFirebaseAction(async () => {
        const batch = writeBatch(db)
        itemsSnapshot.docs.forEach((doc) => batch.delete(doc.ref))
        batch.delete(fridgeDoc(fridgeId))
        await batch.commit()
    }, 'Kühlschrank gelöscht')
}

export async function shareFridge(fridgeId: string, email: string) {
    const result = await runFirebaseAction(
        () =>
            updateDoc(fridgeDoc(fridgeId), {
                sharedWithEmails: arrayUnion(email.toLowerCase()),
            }),
        `Erfolgreich mit ${email} geteilt`
    )
    postNotify('fridge-invite', { fridgeId, inviteeEmail: email.toLowerCase() })
    return result
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

export async function deleteItem(fridgeId: string, itemId: string, itemName?: string) {
    const result = await runFirebaseAction(
        () => deleteDoc(itemDoc(fridgeId, itemId)),
        'Produkt entfernt'
    )
    postNotify('fridge-activity', { fridgeId, action: 'item_removed', itemName: itemName ?? 'an item' })
    return result
}

export async function addItemToFridge(
    fridgeId: string,
    product: Product,
    options: NewItemOptions = {}
) {
    const result = await runFirebaseAction(
        () =>
            addDoc(itemsCollection(fridgeId), newItemPayload(product, options)),
        `"${product.product_name}" hinzugefügt!`
    )
    postNotify('fridge-activity', { fridgeId, action: 'item_added', itemName: product.product_name })
    return result
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

export async function updateItemUnit(
    fridgeId: string,
    itemId: string,
    unit: string
) {
    return runFirebaseAction(
        () => updateDoc(itemDoc(fridgeId, itemId), { unit }),
        'Einheit aktualisiert'
    )
}
