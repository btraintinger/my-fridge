'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { FormField } from '../../components/ui/FormField'
import { GoogleSignInButton } from '../../components/ui/GoogleSignInButton'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { registerSchema, type RegisterFormData } from '../../lib/validations'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { FirebaseError } from 'firebase/app'

export default function Register() {
    const [serverError, setServerError] = useState('')
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onBlur',
        defaultValues: { name: '', email: '', password: '' },
    })

    const onSubmit = async (data: RegisterFormData) => {
        setServerError('')

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            )
            await updateProfile(userCredential.user, { displayName: data.name })
            toast.success('Konto erfolgreich erstellt!')
            router.push('/fridges')
        } catch (err: unknown) {
            const message =
                (err as FirebaseError).message || 'Konto konnte nicht erstellt werden.'
            setServerError(message)
            toast.error(message)
        }
    }

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Start managing your fridge waste-free."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                {serverError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-100 dark:border-red-900/50 animate-in shake-in duration-300">
                        {serverError}
                    </div>
                )}

                <FormField label="Name" required error={errors.name?.message}>
                    <Input
                        type="text"
                        placeholder="Your name"
                        error={!!errors.name}
                        {...register('name')}
                    />
                </FormField>

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
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 mt-1">
                        Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl, 1 Sonderzeichen
                    </p>
                </FormField>

                <Button
                    type="submit"
                    className="w-full mt-4 h-14 rounded-2xl text-lg shadow-lg"
                    disabled={isSubmitting || !isValid}
                >
                    {isSubmitting ? 'Creating account...' : 'Sign Up'}
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
                <GoogleSignInButton text="Sign up with Google" />
            </div>

            <p className="mt-10 text-base text-slate-500 dark:text-slate-400 font-medium text-center">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    )
}
