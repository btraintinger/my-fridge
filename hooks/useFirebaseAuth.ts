import { useCallback } from 'react'
import {
    deleteUser,
    EmailAuthProvider,
    GoogleAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    updatePassword,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'

const PASSWORD_PROVIDER_ID = 'password'

/**
 * Custom hook for Firebase authentication operations
 * Can be used in any component - parent or subcomponent
 * Handles reauthentication and password/account operations
 */
export function useFirebaseAuth() {
    const reauthenticateUser = useCallback(async (password?: string) => {
        const currentUser = auth.currentUser

        if (!currentUser) {
            throw new Error('Your session has expired. Please sign in again.')
        }

        const hasPasswordProvider = currentUser.providerData.some(
            (provider) => provider.providerId === PASSWORD_PROVIDER_ID
        )

        if (hasPasswordProvider) {
            if (!currentUser.email) {
                throw new Error('No account email was found for this profile.')
            }

            if (!password) {
                throw new Error('Enter your current password to continue.')
            }

            const credential = EmailAuthProvider.credential(currentUser.email, password)
            await reauthenticateWithCredential(currentUser, credential)
            return currentUser
        }

        await reauthenticateWithPopup(currentUser, new GoogleAuthProvider())
        return currentUser
    }, [])

    const updateUserPassword = useCallback(
        async (currentPassword: string, newPassword: string) => {
            const currentUser = await reauthenticateUser(currentPassword)
            await updatePassword(currentUser, newPassword)
        },
        [reauthenticateUser]
    )

    const deleteUserAccount = useCallback(
        async (password?: string) => {
            const currentUser = await reauthenticateUser(password)
            await deleteUser(currentUser)
        },
        [reauthenticateUser]
    )

    const formatAuthError = useCallback(
        (error: unknown, defaultMessage: string) => {
            return getFirebaseAuthErrorMessage(error, defaultMessage)
        },
        []
    )

    return {
        reauthenticateUser,
        updateUserPassword,
        deleteUserAccount,
        formatAuthError,
    }
}

