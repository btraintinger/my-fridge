import { collection, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../constants'
import {
    fcmTokenConverter,
    fridgeConverter,
    productConverter,
    shoppingListItemConverter,
    userPreferencesConverter,
} from '../schemas'

export const fridgesCollection = () =>
    collection(db, COLLECTIONS.FRIDGES).withConverter(fridgeConverter)

export const fridgeDoc = (fridgeId: string) =>
    doc(db, COLLECTIONS.FRIDGES, fridgeId).withConverter(fridgeConverter)

// FridgeItem hydration happens async after read; the items collection stays
// untyped so we can plug in the product in the service layer.
export const itemsCollection = (fridgeId: string) =>
    collection(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.ITEMS)

export const itemDoc = (fridgeId: string, itemId: string) =>
    doc(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.ITEMS, itemId)

export const shoppingListCollection = (fridgeId: string) =>
    collection(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.SHOPPING_LIST)
        .withConverter(shoppingListItemConverter)

export const shoppingItemDoc = (fridgeId: string, itemId: string) =>
    doc(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.SHOPPING_LIST, itemId)
        .withConverter(shoppingListItemConverter)

export const userDoc = (userId: string) =>
    doc(db, COLLECTIONS.USERS, userId).withConverter(userPreferencesConverter)

export const productDoc = (barcode: string) =>
    doc(db, COLLECTIONS.PRODUCTS, barcode).withConverter(productConverter)

export const userFcmTokensRef = (uid: string) =>
    collection(db, COLLECTIONS.USERS, uid, COLLECTIONS.FCM_TOKENS)
        .withConverter(fcmTokenConverter)

export const userFcmTokenRef = (uid: string, token: string) =>
    doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.FCM_TOKENS, token)
        .withConverter(fcmTokenConverter)
