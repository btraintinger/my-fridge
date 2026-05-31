'use client'

import { Suspense, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
import { auth } from '@/lib/firebase'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { createLoginSchema, type LoginFormData } from '@/lib/validations'

function LoginForm() {
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
    const searchParams = useSearchParams()
    const showVerificationSent = searchParams.get('verification') === 'sent'

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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            {showVerificationSent && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-semibold border border-emerald-100 dark:border-emerald-900/50">
                    {t('auth.login.verificationSentBanner')}
                </div>
            )}

            {message && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-semibold border border-emerald-100 dark:border-emerald-900/50 animate-in fade-in duration-200">
                    {message}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-100 dark:border-red-900/50 animate-in shake-in duration-300">
                    {error}
                </div>
            )}

            <FormField
                label={t('auth.fields.email')}
                required
                error={errors.email?.message}
            >
                <Input
                    type="email"
                    placeholder={t('auth.fields.emailPlaceholder')}
                    error={!!errors.email}
                    {...register('email')}
                />
            </FormField>

            <FormField
                label={t('auth.fields.password')}
                required
                error={errors.password?.message}
            >
                <Input
                    type="password"
                    placeholder={t('auth.fields.passwordPlaceholder')}
                    error={!!errors.password}
                    {...register('password')}
                />
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {(attemptedUnverifiedLogin || showVerificationSent) && (
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl"
                            onClick={handleResendVerification}
                            disabled={
                                isSubmitting ||
                                verificationLoading ||
                                resetLoading
                            }
                        >
                            {verificationLoading
                                ? t('auth.login.sendingVerification')
                                : t('auth.login.resendVerification')}
                        </Button>
                    )}

                    {attemptedWrongCredentials && (
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl"
                            onClick={handleForgotPassword}
                            disabled={
                                isSubmitting ||
                                verificationLoading ||
                                resetLoading
                            }
                        >
                            {resetLoading
                                ? t('auth.login.sendingResetEmail')
                                : t('auth.login.forgotPassword')}
                        </Button>
                    )}
                </div>
            </FormField>

            <Button
                type="submit"
                className="w-full mt-4 h-14 rounded-2xl text-lg shadow-lg"
                disabled={isSubmitting || verificationLoading || resetLoading}
            >
                {isSubmitting
                    ? t('auth.login.submitting')
                    : t('auth.login.submit')}
            </Button>
        </form>
    )
}

export default function Login() {
    const t = useTranslations('auth.login')

    return (
        <AuthLayout title={t('title')} subtitle={t('subtitle')}>
            <Suspense
                fallback={
                    <div className="w-full flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                }
            >
                <LoginForm />
            </Suspense>

            <div className="w-full flex items-center gap-4 my-8">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {t('socialDivider')}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            <div className="w-full">
                <GoogleSignInButton text={t('googleButton')} />
            </div>

            <p className="mt-10 text-base text-slate-500 dark:text-slate-400 font-medium text-center">
                {t('noAccount')}{' '}
                <Link
                    href="/register"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
                >
                    {t('signUpLink')}
                </Link>
            </p>
        </AuthLayout>
    )
}
