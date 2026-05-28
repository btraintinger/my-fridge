'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserPreferences } from '@/lib/services/userService'

export function LanguageSwitcher() {
    const t = useTranslations('settings.language')
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const { user } = useAuth()

    const handleChange = (newLocale: (typeof routing.locales)[number]) => {
        if (user) {
            void updateUserPreferences(user.uid, { locale: newLocale }).catch(
                (e) => console.error('Failed to save locale preference:', e)
            )
        }
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <div
            className="flex gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            role="group"
            aria-label={t('switchAria')}
        >
            {routing.locales.map((loc: (typeof routing.locales)[number]) => (
                <button
                    key={loc}
                    type="button"
                    onClick={() => handleChange(loc)}
                    className={
                        loc === locale
                            ? 'flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors'
                            : 'flex-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }
                >
                    {t(loc as 'en' | 'de')}
                </button>
            ))}
        </div>
    )
}
