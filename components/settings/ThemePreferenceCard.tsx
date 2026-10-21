'use client'

import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/switch'

interface ThemePreferenceCardProps {
    darkMode: boolean
    onToggle: () => void
}

export const ThemePreferenceCard = ({
    darkMode,
    onToggle,
}: ThemePreferenceCardProps) => {
    const t = useTranslations('settings.theme')

    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">
                        {t('title')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {darkMode ? t('on') : t('off')}
                    </p>
                </div>
            </div>

            <Switch
                checked={darkMode}
                onCheckedChange={onToggle}
                aria-label={darkMode ? t('turnOff') : t('turnOn')}
            />
        </div>
    )
}

ThemePreferenceCard.displayName = 'ThemePreferenceCard'
