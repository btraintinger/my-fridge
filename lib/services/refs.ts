import { collection, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../constants'

export const fridgesCollection = () => collection(db, COLLECTIONS.FRIDGES)

export const fridgeDoc = (fridgeId: string) =>
    doc(db, COLLECTIONS.FRIDGES, fridgeId)

export const itemsCollection = (fridgeId: string) =>
    collection(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.ITEMS)

export const itemDoc = (fridgeId: string, itemId: string) =>
    doc(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.ITEMS, itemId)

export const shoppingListCollection = (fridgeId: string) =>
    collection(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.SHOPPING_LIST)

export const shoppingItemDoc = (fridgeId: string, itemId: string) =>
    doc(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.SHOPPING_LIST, itemId)

export const userDoc = (userId: string) =>
    doc(db, COLLECTIONS.USERS, userId)

export const productDoc = (barcode: string) =>
    doc(db, COLLECTIONS.PRODUCTS, barcode)
