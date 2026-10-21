import {
    type FirestoreError,
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
    runTransaction,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore'
import type { Fridge, FridgeItem, Product } from '@/lib/types'
import { db } from '@/lib/firebase'
import { runFirebaseAction, subscriptionErrorHandler } from './firebaseAction'
import { executeBatch } from './executeBatch'
import {
    fridgeDoc,
    fridgesCollection,
    itemDoc,
    itemsCollection,
    shoppingListCollection,
    shoppingItemDoc,
} from './refs'
import { postNotify } from '@/lib/notificationsClient'
import { normalizeGrade } from '@/lib/utils'
import {
    PRODUCT_CATEGORIES,
    type ProductCategory,
} from '@/lib/products/productCategorization'

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
    return runFirebaseAction(
        () =>
            executeBatch((batch) => {
                itemsSnapshot.docs.forEach((d) => batch.delete(d.ref))
                shoppingSnapshot.docs.forEach((d) => batch.delete(d.ref))
                batch.delete(fridgeDoc(fridgeId))
            }),
        { key: 'toast.fridgeDeleted' }
    )
}

export async function shareFridge(fridgeId: string, email: string) {
    const result = await runFirebaseAction(
        () =>
            updateDoc(fridgeDoc(fridgeId), {
                sharedWithEmails: arrayUnion(email.toLowerCase()),
            }),
        { key: 'toast.fridgeShared', values: { email } }
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
        { key: 'toast.accessRemoved', values: { email } }
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
    const result = await runFirebaseAction(
        () =>
            executeBatch((batch) => {
                batch.delete(itemDoc(fridgeId, itemId))
                const delta = gradeCountDelta(prev.grade, -prev.quantity)
                if (delta) batch.update(fridgeDoc(fridgeId), delta)
            }),
        { key: 'toast.productRemoved' }
    )
    postNotify('fridge-activity', {
        fridgeId,
        action: 'item_removed',
        itemName: prev.itemName ?? '@@unnamedItem',
    })
    return result
}
export async function saveItemToFridge(
    fridgeId: string,
    product: Product,
    options: NewItemOptions = {},
    shoppingItemId?: string
) {
    const payload = newItemPayload(product, options)
    const items = itemsCollection(fridgeId)
    // Find older entries too, which were created with random IDs.
    const matches = await getDocs(
        query(items, where('product.barcode', '==', product.barcode))
    )
    const existing = matches.docs.find(
        (snapshot) =>
            (snapshot.data().expiryDate || '') === (options.expiryDate || '')
    )
    // A stable ID prevents simultaneous first additions from creating
    // separate entries. The transaction retries if the quantity changes.
    const targetRef =
        existing?.ref ??
        doc(
            items,
            `barcode-${encodeURIComponent(product.barcode)}-expiry-${encodeURIComponent(options.expiryDate || '')}`
        )
    await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(targetRef)
        const current = snapshot.exists() ? snapshot.data() : null
        if (current) {
            transaction.update(targetRef, {
                quantity: (current.quantity ?? 1) + payload.quantity,
            })
        } else {
            transaction.set(targetRef, payload)
        }
        const delta = gradeCountDelta(
            current
                ? current.product.nutriscore_grade
                : product.nutriscore_grade,
            payload.quantity
        )
        if (delta) transaction.update(fridgeDoc(fridgeId), delta)
        if (shoppingItemId) {
            transaction.delete(shoppingItemDoc(fridgeId, shoppingItemId))
        }
    })
}

export async function addItemToFridge(
    fridgeId: string,
    product: Product,
    options: NewItemOptions = {}
) {
    const result = await runFirebaseAction(
        async () => {
            await saveItemToFridge(fridgeId, product, options)
        },
        { key: 'toast.productAdded', values: { name: product.product_name } }
    )
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
    return runFirebaseAction(() =>
        executeBatch((batch) => {
            batch.update(itemDoc(fridgeId, itemId), { quantity })
            const delta = gradeCountDelta(prev.grade, quantity - prev.quantity)
            if (delta) batch.update(fridgeDoc(fridgeId), delta)
        })
    )
}

export async function updateItemExpiryDate(
    fridgeId: string,
    itemId: string,
    expiryDate: string
) {
    return runFirebaseAction(async () => {
        await updateDoc(itemDoc(fridgeId, itemId), { expiryDate })
    })
}

export async function updateItemCategory(
    fridgeId: string,
    itemId: string,
    category: ProductCategory
) {
    if (!PRODUCT_CATEGORIES.includes(category)) {
        throw new Error('Invalid product category')
    }
    return runFirebaseAction(
        () =>
            updateDoc(itemDoc(fridgeId, itemId), {
                'product.category': category,
            }),
        { key: 'toast.categoryUpdated' }
    )
}

export async function updateItemUnit(
    fridgeId: string,
    itemId: string,
    unit: string
) {
    return runFirebaseAction(
        () => updateDoc(itemDoc(fridgeId, itemId), { unit }),
        { key: 'toast.unitUpdated' }
    )
}
