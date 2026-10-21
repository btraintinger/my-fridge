import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { auth } from '@/lib/firebase'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'
import { createLoginSchema, type LoginFormData } from '@/lib/validations'

export function useLoginForm() {
    const t = useTranslations()
    const schema = useMemo(() => createLoginSchema(t), [t])

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: { email: '', password: '' },
    })

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [verificationLoading, setVerificationLoading] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    const [attemptedUnverifiedLogin, setAttemptedUnverifiedLogin] =
        useState(false)
    const [attemptedWrongCredentials, setAttemptedWrongCredentials] =
        useState(false)
    const router = useRouter()

    const onSubmit = async (data: LoginFormData) => {
        setError('')
        setMessage('')

        setAttemptedUnverifiedLogin(false)
        setAttemptedWrongCredentials(false)

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                data.email,
                data.password
            )

            const hasPasswordProvider = userCredential.user.providerData.some(
                (provider) => provider.providerId === 'password'
            )

            if (hasPasswordProvider && !userCredential.user.emailVerified) {
                setAttemptedUnverifiedLogin(true)
                await signOut(auth)
                setError(t('auth.login.verifyEmailFirst'))
                return
            }

            router.push('/fridges')
        } catch (err: unknown) {
            const firebaseError = err as Record<string, unknown>
            const code = (firebaseError?.code as string) ?? ''

            if (
                code === 'auth/wrong-password' ||
                code === 'auth/invalid-login-credentials' ||
                code === 'auth/invalid-credential'
            ) {
                setAttemptedWrongCredentials(true)
            }

            setError(
                getFirebaseAuthErrorMessage(err, t('auth.login.loginFailed'), t)
            )
        }
    }

    const handleResendVerification = async () => {
        setVerificationLoading(true)
        setError('')
        setMessage('')

        const { email, password } = getValues()

        if (!email?.trim() || !password) {
            setError(t('auth.login.missingEmailPasswordForResend'))
            setVerificationLoading(false)
            return
        }

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            )

            if (
                userCredential.user.providerData.some(
                    (provider) => provider.providerId === 'password'
                )
            ) {
                if (!userCredential.user.emailVerified) {
                    await sendEmailVerification(userCredential.user)
                    setMessage(t('auth.login.verificationResent'))
                } else {
                    setMessage(t('auth.login.alreadyVerified'))
                }

                await signOut(auth)

                setAttemptedUnverifiedLogin(false)
            }
        } catch (err: unknown) {
            setError(
                getFirebaseAuthErrorMessage(
                    err,
                    t('auth.login.resendVerificationFailed'),
                    t
                )
            )
        } finally {
            setVerificationLoading(false)
        }
    }

    const handleForgotPassword = async () => {
        setResetLoading(true)
        setError('')
        setMessage('')

        const { email } = getValues()

        if (!email?.trim()) {
            setError(t('auth.login.missingEmailForReset'))
            setResetLoading(false)
            return
        }

        try {
            await sendPasswordResetEmail(auth, email.trim())
            setMessage(t('auth.login.passwordResetSent'))
        } catch (err: unknown) {
            setError(
                getFirebaseAuthErrorMessage(
                    err,
                    t('auth.login.resetEmailFailed'),
                    t
                )
            )
        } finally {
            setResetLoading(false)
        }
    }

    return {
        register,
        errors,
        isSubmitting,
        error,
        message,
        verificationLoading,
        resetLoading,
        attemptedUnverifiedLogin,
        attemptedWrongCredentials,
        onSubmit: handleSubmit(onSubmit),
        handleResendVerification,
        handleForgotPassword,
    }
}
