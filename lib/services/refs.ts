import { collection, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/constants'
import {
    fcmTokenConverter,
    fridgeConverter,
    fridgeItemConverter,
    productConverter,
    shoppingListItemConverter,
    userPreferencesConverter,
} from '@/lib/schemas'

export const fridgesCollection = () =>
    collection(db, COLLECTIONS.FRIDGES).withConverter(fridgeConverter)

export const fridgeDoc = (fridgeId: string) =>
    doc(db, COLLECTIONS.FRIDGES, fridgeId).withConverter(fridgeConverter)

export const itemsCollection = (fridgeId: string) =>
    collection(
        db,
        COLLECTIONS.FRIDGES,
        fridgeId,
        COLLECTIONS.ITEMS
    ).withConverter(fridgeItemConverter)

export const itemDoc = (fridgeId: string, itemId: string) =>
    doc(
        db,
        COLLECTIONS.FRIDGES,
        fridgeId,
        COLLECTIONS.ITEMS,
        itemId
    ).withConverter(fridgeItemConverter)

export const shoppingListCollection = (fridgeId: string) =>
    collection(
        db,
        COLLECTIONS.FRIDGES,
        fridgeId,
        COLLECTIONS.SHOPPING_LIST
    ).withConverter(shoppingListItemConverter)

export const shoppingItemDoc = (fridgeId: string, itemId: string) =>
    doc(
        db,
        COLLECTIONS.FRIDGES,
        fridgeId,
        COLLECTIONS.SHOPPING_LIST,
        itemId
    ).withConverter(shoppingListItemConverter)

export const userDoc = (userId: string) =>
    doc(db, COLLECTIONS.USERS, userId).withConverter(userPreferencesConverter)

export const productDoc = (barcode: string) =>
    doc(db, COLLECTIONS.PRODUCTS, barcode).withConverter(productConverter)

export const userFcmTokensRef = (uid: string) =>
    collection(
        db,
        COLLECTIONS.USERS,
        uid,
        COLLECTIONS.FCM_TOKENS
    ).withConverter(fcmTokenConverter)

export const userFcmTokenRef = (uid: string, token: string) =>
    doc(
        db,
        COLLECTIONS.USERS,
        uid,
        COLLECTIONS.FCM_TOKENS,
        token
    ).withConverter(fcmTokenConverter)
