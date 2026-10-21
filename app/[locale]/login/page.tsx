'use client'

import { Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Spinner } from '@/components/feedback/Spinner'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export default function Login() {
    const t = useTranslations('auth.login')

    return (
        <AuthLayout title={t('title')} subtitle={t('subtitle')}>
            <Suspense
                fallback={
                    <div className="w-full flex items-center justify-center p-8">
                        <Spinner className="w-8 h-8" />
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
