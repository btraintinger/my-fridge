'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { ScanLine } from 'lucide-react'

export default function Home() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const t = useTranslations('home')

    useEffect(() => {
        if (!loading && user) {
            router.push('/fridges')
        }
    }, [user, loading, router])

    if (loading || user) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-3xl mb-4"></div>
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-md w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-emerald-500 text-white p-6 rounded-[2.5rem] mb-10 shadow-2xl shadow-emerald-500/30 dark:shadow-emerald-900/40">
                    <ScanLine size={64} strokeWidth={1.5} />
                </div>

                <h1 className="text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-6">
                    My
                    <span className="text-emerald-600 dark:text-emerald-400">
                        Fridge
                    </span>
                </h1>

                <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 leading-relaxed font-medium">
                    {t('tagline')}
                </p>

                <div className="w-full flex flex-col gap-4">
                    <Link href="/register" className="w-full">
                        <Button
                            size="lg"
                            className="w-full h-16 rounded-2xl text-xl shadow-lg"
                        >
                            {t('getStarted')}
                        </Button>
                    </Link>
                    <Link href="/login" className="w-full">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="w-full h-16 rounded-2xl text-xl"
                        >
                            {t('signIn')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
