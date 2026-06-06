import { adminDb } from './firebaseAdmin'
import { COLLECTIONS } from '../constants'
import {
    FcmTokenDocSchema,
    FridgeSchema,
    ProductSchema,
    UserPreferencesSchema,
} from '../schemas'
import { zodAdminConverter } from './zodAdminConverter'

const fridgeAdminConverter = zodAdminConverter(FridgeSchema)
const userPreferencesAdminConverter = zodAdminConverter(UserPreferencesSchema)
const fcmTokenAdminConverter = zodAdminConverter(FcmTokenDocSchema)
const productAdminConverter = zodAdminConverter(ProductSchema)

export const fridgesAdminCollection = () =>
    adminDb.collection(COLLECTIONS.FRIDGES).withConverter(fridgeAdminConverter)

export const fridgeAdminDoc = (fridgeId: string) =>
    adminDb
        .collection(COLLECTIONS.FRIDGES)
        .doc(fridgeId)
        .withConverter(fridgeAdminConverter)

export const userAdminDoc = (uid: string) =>
    adminDb
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .withConverter(userPreferencesAdminConverter)

export const userFcmTokensAdminRef = (uid: string) =>
    adminDb
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .collection(COLLECTIONS.FCM_TOKENS)
        .withConverter(fcmTokenAdminConverter)

export const userFcmTokenAdminRef = (uid: string, token: string) =>
    adminDb
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .collection(COLLECTIONS.FCM_TOKENS)
        .doc(token)
        .withConverter(fcmTokenAdminConverter)

export const productAdminDoc = (barcode: string) =>
    adminDb
        .collection(COLLECTIONS.PRODUCTS)
        .doc(barcode)
        .withConverter(productAdminConverter)
