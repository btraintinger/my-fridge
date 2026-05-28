'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { auth } from '@/lib/firebase'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { createRegisterSchema, type RegisterFormData } from '@/lib/validations'
import { notify } from '@/lib/notify'

export default function Register() {
    const t = useTranslations()
    const [serverError, setServerError] = useState('')
    const router = useRouter()
    const schema = useMemo(() => createRegisterSchema(t), [t])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(schema),
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
            notify.success(t('auth.register.accountCreated'))
            router.push('/fridges')
        } catch (err: unknown) {
            const message = getFirebaseAuthErrorMessage(
                err,
                t('auth.register.accountCreationFailed'),
                t
            )
            setServerError(message)
            notify.error(message)
        }
    }

    return (
        <AuthLayout
            title={t('auth.register.title')}
            subtitle={t('auth.register.subtitle')}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                {serverError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-100 dark:border-red-900/50 animate-in shake-in duration-300">
                        {serverError}
                    </div>
                )}

                <FormField
                    label={t('auth.register.name')}
                    required
                    error={errors.name?.message}
                >
                    <Input
                        type="text"
                        placeholder={t('auth.register.namePlaceholder')}
                        error={!!errors.name}
                        {...register('name')}
                    />
                </FormField>

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
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 mt-1">
                        {t('auth.register.passwordRules')}
                    </p>
                </FormField>

                <Button
                    type="submit"
                    className="w-full mt-4 h-14 rounded-2xl text-lg shadow-lg"
                    disabled={isSubmitting || !isValid}
                >
                    {isSubmitting
                        ? t('auth.register.submitting')
                        : t('auth.register.submit')}
                </Button>
            </form>

            <div className="w-full flex items-center gap-4 my-8">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    {t('auth.register.socialDivider')}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            <div className="w-full">
                <GoogleSignInButton text={t('auth.register.googleButton')} />
            </div>

            <p className="mt-10 text-base text-slate-500 dark:text-slate-400 font-medium text-center">
                {t('auth.register.haveAccount')}{' '}
                <Link
                    href="/login"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
                >
                    {t('auth.register.signInLink')}
                </Link>
            </p>
        </AuthLayout>
    )
}
