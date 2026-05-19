'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { FormField } from '../../components/ui/FormField'
import { GoogleSignInButton } from '../../components/ui/GoogleSignInButton'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { loginSchema, type LoginFormData } from '../../lib/validations'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { FirebaseError } from 'firebase/app'

export default function Login() {
    const [serverError, setServerError] = useState('')
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = async (data: LoginFormData) => {
        setServerError('')

        try {
            await signInWithEmailAndPassword(auth, data.email, data.password)
            toast.success('Erfolgreich angemeldet!')
            router.push('/fridges')
        } catch (err: unknown) {
            const message =
                (err as FirebaseError).message ||
                'Anmeldung fehlgeschlagen. Bitte versuche es erneut.'
            setServerError(message)
            toast.error(message)
        }
    }

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Enter your details to access your fridges."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                {serverError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-100 dark:border-red-900/50 animate-in shake-in duration-300">
                        {serverError}
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
                </FormField>

                <Button
                    type="submit"
                    className="w-full mt-4 h-14 rounded-2xl text-lg shadow-lg"
                    disabled={isSubmitting || !isValid}
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
