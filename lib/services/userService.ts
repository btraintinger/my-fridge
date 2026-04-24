import {
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore'
import type { FirestoreError } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTIONS } from '../constants'
import { UserPreferences } from '../types'
import { BaseService } from './base'

class UserService extends BaseService {
    async ensureUserPreferencesDocument(userId: string) {
        return this.handleAction(async () => {
            const userRef = doc(db, COLLECTIONS.USERS, userId)
            const userDoc = await getDoc(userRef)

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    userId,
                    darkMode: false,
                    updatedAt: serverTimestamp(),
                })
            }
        })
    }

    async getUserPreferences(userId: string): Promise<UserPreferences | null> {
        try {
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId))
            if (userDoc.exists()) {
                return userDoc.data() as UserPreferences
            }
            return null
        } catch (error) {
            console.error('Error fetching user preferences:', error)
            return null
        }
    }

    subscribeToUserPreferences(
        userId: string,
        callback: (prefs: Partial<UserPreferences>) => void,
        onError?: (error: FirestoreError) => void
    ) {
        return onSnapshot(
            doc(db, COLLECTIONS.USERS, userId),
            (docSnap) => {
                if (docSnap.exists()) {
                    callback(docSnap.data() as Partial<UserPreferences>)
                }
            },
            onError
        )
    }

    async updateUserPreferences(
        userId: string,
        updates: Partial<UserPreferences>
    ) {
        return this.handleAction(async () => {
            const userRef = doc(db, COLLECTIONS.USERS, userId)
            const userDoc = await getDoc(userRef)

            if (!userDoc.exists()) {
                // Create with defaults if doesn't exist
                await setDoc(userRef, {
                    userId,
                    darkMode: false,
                    ...updates,
                    updatedAt: serverTimestamp(),
                })
            } else {
                await updateDoc(userRef, {
                    ...updates,
                    updatedAt: serverTimestamp(),
                })
            }
        })
    }

    async toggleDarkMode(userId: string, currentDarkMode: boolean) {
        return this.updateUserPreferences(userId, {
            darkMode: !currentDarkMode,
        })
    }
}

export const userService = new UserService()
