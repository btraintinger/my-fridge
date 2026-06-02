import type { FirebaseError } from 'firebase/app'

export const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
    'auth/cancelled-popup-request': 'Sign-in request was cancelled. Please try again.',
    'auth/email-already-in-use': 'This email is already in use.',
    'auth/invalid-credential': 'Please verify your credentials and try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-login-credentials': 'Invalid email or password.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/operation-not-allowed': 'This sign-in method is not currently available.',
    'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/requires-recent-login': 'For security, sign in again and repeat this action.',
    'auth/too-many-requests': 'Too many attempts. Please wait and retry.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found for this email.',
    'auth/weak-password': 'Choose a stronger password (at least 6 characters).',
    'auth/wrong-password': 'Current password is incorrect.',
}

export function getFirebaseAuthErrorMessage(error: unknown, fallback: string): string {
    const firebaseError = error as Partial<FirebaseError> | null
    const code = firebaseError?.code ?? ''

    return (
        FIREBASE_AUTH_ERROR_MESSAGES[code] ||
        (typeof firebaseError?.message === 'string' && firebaseError.message) ||
        fallback
    )
}

