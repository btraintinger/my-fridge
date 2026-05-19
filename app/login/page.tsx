'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { FormField } from '../../components/ui/FormField'
import { GoogleSignInButton } from '../../components/ui/GoogleSignInButton'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { loginSchema, type LoginFormData } from '../../lib/validations'
import Link from 'next/link'

export default function Login() {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: { email: '', password: '' },
    })

    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [verificationLoading, setVerificationLoading] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    const [attemptedUnverifiedLogin, setAttemptedUnverifiedLogin] = useState(false)
    const [attemptedWrongCredentials, setAttemptedWrongCredentials] = useState(false)
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
                setError(
                    'Please verify your email before signing in. Resend verification email if needed.'
                )
                return
            }

            router.push('/fridges')
        } catch (err: unknown) {
            const firebaseError = err as Record<string, unknown>
            const code = (firebaseError?.code as string) ?? ''

            // only show forgot-password when credentials were wrong (not when account missing)
            if (
                code === 'auth/wrong-password' ||
                code === 'auth/invalid-login-credentials' ||
                code === 'auth/invalid-credential'
            ) {
                setAttemptedWrongCredentials(true)
            }

            setError(getFirebaseAuthErrorMessage(err, 'Failed to login. Please try again.'))
        }
    }

    const handleResendVerification = async () => {
        setVerificationLoading(true)
        setError('')
        setMessage('')

        const { email, password } = getValues()

        if (!email?.trim() || !password) {
            setError('Enter your email and password to resend the verification email.')
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
                    setMessage('Verification email sent. Check your inbox, then sign in again.')
                } else {
                    setMessage('This account is already verified. You can sign in normally.')
                }

                await signOut(auth)

                setAttemptedUnverifiedLogin(false)
            }
        } catch (err: unknown) {
            setError(
                getFirebaseAuthErrorMessage(
                    err,
                    'Could not resend verification email. Please try again.'
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
            setError('Enter your email address to receive a password reset email.')
            setResetLoading(false)
            return
        }

        try {
            await sendPasswordResetEmail(auth, email.trim())
            setMessage('Password reset email sent. Check your inbox.')
        } catch (err: unknown) {
            setError(
                getFirebaseAuthErrorMessage(
                    err,
                    'Could not send password reset email. Please try again.'
                )
            )
        } finally {
            setResetLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Enter your details to access your fridges."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                {showVerificationSent && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-semibold border border-emerald-100 dark:border-emerald-900/50">
                        Verification email sent. Check your inbox before signing in.
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

                <FormField label="Email" required error={errors.email?.message}>
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        error={!!errors.email}
                        {...register('email')}
                    />
                </FormField>

                <FormField label="Password" required error={errors.password?.message}>
                    <Input
                        type="password"
                        placeholder="••••••••"
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
                                disabled={isSubmitting || verificationLoading || resetLoading}
                            >
                                {verificationLoading
                                    ? 'Sending verification...'
                                    : 'Resend verification email'}
                            </Button>
                        )}

                        {attemptedWrongCredentials && (
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl"
                                onClick={handleForgotPassword}
                                disabled={isSubmitting || verificationLoading || resetLoading}
                            >
                                {resetLoading ? 'Sending reset email...' : 'Forgot password?'}
                            </Button>
                        )}
                    </div>
                </FormField>

                <Button
                    type="submit"
                    className="w-full mt-4 h-14 rounded-2xl text-lg shadow-lg"
                    disabled={isSubmitting || verificationLoading || resetLoading}
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <div className="w-full flex items-center gap-4 my-8">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    Social login
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            <div className="w-full">
                <GoogleSignInButton text="Sign in with Google" />
            </div>

            <p className="mt-10 text-base text-slate-500 dark:text-slate-400 font-medium text-center">
                Don&apos;t have an account?{' '}
                <Link
                    href="/register"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
                >
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    )
}
