import { useCallback } from 'react'
import {
    deleteUser,
    EmailAuthProvider,
    GoogleAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithRedirect,
    updatePassword,
} from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { auth } from '@/lib/firebase'
import {
    getFirebaseAuthErrorMessage,
    LocalizedAuthError,
} from '@/lib/firebaseAuthErrors'

const PASSWORD_PROVIDER_ID = 'password'

export function useFirebaseAuth() {
    const t = useTranslations()

    const reauthenticateUser = useCallback(
        async (password?: string) => {
            const currentUser = auth.currentUser

            if (!currentUser) {
                throw new LocalizedAuthError(t('auth.errors.sessionExpired'))
            }

            const hasPasswordProvider = currentUser.providerData.some(
                (provider) => provider.providerId === PASSWORD_PROVIDER_ID
            )

            if (hasPasswordProvider) {
                if (!currentUser.email) {
                    throw new LocalizedAuthError(
                        t('auth.errors.missingAccountEmail')
                    )
                }

                if (!password) {
                    throw new LocalizedAuthError(
                        t('auth.errors.currentPasswordRequired')
                    )
                }

                const credential = EmailAuthProvider.credential(
                    currentUser.email,
                    password
                )
                await reauthenticateWithCredential(currentUser, credential)
                return currentUser
            }

            await reauthenticateWithRedirect(
                currentUser,
                new GoogleAuthProvider()
            )
            return currentUser
        },
        [t]
    )

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
            return getFirebaseAuthErrorMessage(error, defaultMessage, t)
        },
        [t]
    )

    return {
        reauthenticateUser,
        updateUserPassword,
        deleteUserAccount,
        formatAuthError,
    }
}
