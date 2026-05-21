import {
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore'
import type { FirestoreError } from 'firebase/firestore'
import { UserPreferences } from '../types'
import { runFirebaseAction, subscriptionErrorHandler } from './firebaseAction'
import { userDoc } from './refs'

const DEFAULT_PREFERENCES: Partial<UserPreferences> = {
    darkMode: false,
}

export async function ensureUserPreferencesDocument(userId: string) {
    return runFirebaseAction(async () => {
        const ref = userDoc(userId)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
            await setDoc(ref, {
                userId,
                ...DEFAULT_PREFERENCES,
                updatedAt: serverTimestamp(),
            })
        }
    })
}

export async function getUserPreferences(
    userId: string
): Promise<UserPreferences | null> {
    try {
        const snap = await getDoc(userDoc(userId))
        return snap.exists() ? (snap.data() as UserPreferences) : null
    } catch (error) {
        console.error('Error fetching user preferences:', error)
        return null
    }
}

export function subscribeToUserPreferences(
    userId: string,
    callback: (
        prefs: Partial<UserPreferences>,
        metadata: { hasPendingWrites: boolean }
    ) => void,
    onError?: (error: FirestoreError) => void
) {
    return onSnapshot(
        userDoc(userId),
        { includeMetadataChanges: true },
        (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data() as Partial<UserPreferences>, {
                    hasPendingWrites: docSnap.metadata.hasPendingWrites,
                })
            }
        },
        subscriptionErrorHandler(onError)
    )
}

export async function updateUserPreferences(
    userId: string,
    updates: Partial<UserPreferences>
) {
    return runFirebaseAction(async () => {
        const ref = userDoc(userId)
        const snap = await getDoc(ref)
        const payload = { ...updates, updatedAt: serverTimestamp() }
        if (snap.exists()) {
            await updateDoc(ref, payload)
        } else {
            await setDoc(ref, {
                userId,
                ...DEFAULT_PREFERENCES,
                ...payload,
            })
        }
    })
}

export async function toggleDarkMode(
    userId: string,
    currentDarkMode: boolean
) {
    return updateUserPreferences(userId, { darkMode: !currentDarkMode })
}
