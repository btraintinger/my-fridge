import type { FirebaseError } from 'firebase/app'
import type { useTranslations } from 'next-intl'

type Translator = ReturnType<typeof useTranslations>

export class LocalizedAuthError extends Error {}

const KNOWN_CODES = new Set([
    'auth/cancelled-popup-request',
    'auth/email-already-in-use',
    'auth/invalid-credential',
    'auth/invalid-email',
    'auth/invalid-login-credentials',
    'auth/network-request-failed',
    'auth/operation-not-allowed',
    'auth/popup-blocked',
    'auth/popup-closed-by-user',
    'auth/requires-recent-login',
    'auth/too-many-requests',
    'auth/user-disabled',
    'auth/user-not-found',
    'auth/weak-password',
    'auth/wrong-password',
])

export function getFirebaseAuthErrorMessage(
    error: unknown,
    fallback: string,
    t: Translator
): string {
    const firebaseError = error as Partial<FirebaseError> | null
    const code = firebaseError?.code ?? ''

    if (KNOWN_CODES.has(code)) {
        return t(`auth.firebaseErrors.${code}` as never)
    }

    // Locally created errors already contain translated copy. Unknown SDK
    // errors use the translated fallback instead of exposing raw SDK messages.
    if (error instanceof LocalizedAuthError) {
        return error.message
    }

    return fallback
}
