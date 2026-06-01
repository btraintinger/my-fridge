import type { FirestoreError } from 'firebase/firestore'
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    doc,
    getDocs,
    increment,
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
import { runFirebaseAction, subscriptionErrorHandler } from './firebaseAction'
import {
    fridgeDoc,
    fridgesCollection,
    itemDoc,
    itemsCollection,
    shoppingListCollection,
} from './refs'
import { postNotify } from '../notificationsClient'
import { normalizeGrade } from '../utils'

export type NewItemOptions = {
    quantity?: number
    expiryDate?: string
    notes?: string
}

export function newItemPayload(product: Product, options: NewItemOptions = {}) {
    // Strip cache metadata before embedding — it only makes sense on /products docs.
    const embedded = { ...product }
    delete embedded.updatedAt
    return {
        product: embedded,
        quantity: options.quantity || 1,
        ...(options.expiryDate && { expiryDate: options.expiryDate }),
        ...(options.notes && { notes: options.notes }),
        addedAt: serverTimestamp(),
    }
}

// Returns `{ 'gradeCounts.<g>': increment(delta) }` or `null` if the grade is
// invalid (unknown / "-" / null) — in which case no fridge update is needed.
function gradeCountDelta(
    grade: string | null | undefined,
    delta: number
): Record<string, ReturnType<typeof increment>> | null {
    const key = normalizeGrade(grade)
    if (!key || delta === 0) return null
    return { [`gradeCounts.${key}`]: increment(delta) }
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
        (snap) => callback(snap.docs.map((d) => d.data())),
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
        (snap) => callback(snap.exists() ? snap.data() : null),
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
        (snap) => callback(snap.docs.map((d) => d.data())),
        subscriptionErrorHandler(onError)
    )
}

export async function createFridge(userId: string, name: string) {
    return runFirebaseAction(() =>
        addDoc(fridgesCollection(), {
            name,
            userId,
            sharedWithEmails: [],
            createdAt: serverTimestamp(),
        })
    )
}

export async function deleteFridge(fridgeId: string) {
    const [itemsSnapshot, shoppingSnapshot] = await Promise.all([
        getDocs(itemsCollection(fridgeId)),
        getDocs(shoppingListCollection(fridgeId)),
    ])
    return runFirebaseAction(async () => {
        const batch = writeBatch(db)
        itemsSnapshot.docs.forEach((d) => batch.delete(d.ref))
        shoppingSnapshot.docs.forEach((d) => batch.delete(d.ref))
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

export async function deleteItem(
    fridgeId: string,
    itemId: string,
    prev: {
        grade: string | null | undefined
        quantity: number
        itemName?: string
    }
) {
    const result = await runFirebaseAction(async () => {
        const batch = writeBatch(db)
        batch.delete(itemDoc(fridgeId, itemId))
        const delta = gradeCountDelta(prev.grade, -prev.quantity)
        if (delta) batch.update(fridgeDoc(fridgeId), delta)
        await batch.commit()
    }, 'Produkt entfernt')
    postNotify('fridge-activity', {
        fridgeId,
        action: 'item_removed',
        itemName: prev.itemName ?? 'an item',
    })
    return result
}

export async function addItemToFridge(
    fridgeId: string,
    product: Product,
    options: NewItemOptions = {}
) {
    const result = await runFirebaseAction(async () => {
        const newItemRef = doc(itemsCollection(fridgeId))
        const payload = newItemPayload(product, options)

        const batch = writeBatch(db)
        batch.set(newItemRef, payload)
        const delta = gradeCountDelta(
            product.nutriscore_grade,
            payload.quantity
        )
        if (delta) batch.update(fridgeDoc(fridgeId), delta)
        await batch.commit()
    }, `"${product.product_name}" hinzugefügt!`)
    postNotify('fridge-activity', {
        fridgeId,
        action: 'item_added',
        itemName: product.product_name,
    })
    return result
}

export async function updateItemQuantity(
    fridgeId: string,
    itemId: string,
    quantity: number,
    prev: { grade: string | null | undefined; quantity: number }
) {
    return runFirebaseAction(async () => {
        const batch = writeBatch(db)
        batch.update(itemDoc(fridgeId, itemId), { quantity })
        const delta = gradeCountDelta(prev.grade, quantity - prev.quantity)
        if (delta) batch.update(fridgeDoc(fridgeId), delta)
        await batch.commit()
    }, 'Menge aktualisiert')
}

export async function updateItemExpiryDate(
    fridgeId: string,
    itemId: string,
    expiryDate: string
) {
    return runFirebaseAction(async () => {
        await updateDoc(itemDoc(fridgeId, itemId), { expiryDate })
    }, 'Ablaufdatum aktualisiert')
}
