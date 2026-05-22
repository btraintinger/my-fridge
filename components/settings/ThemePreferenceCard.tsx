'use client'

import { Moon, Sun } from 'lucide-react'
import { cn } from '@/components/ui/Button'

interface ThemePreferenceCardProps {
    darkMode: boolean
    onToggle: () => void
}

export const ThemePreferenceCard = ({
    darkMode,
    onToggle,
}: ThemePreferenceCardProps) => {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">
                        Dark Mode
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {darkMode ? 'On' : 'Off'}
                    </p>
                </div>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                onClick={onToggle}
                className={cn(
                    'relative h-8 w-14 flex-none overflow-hidden rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-0',
                    darkMode
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                )}
                aria-label={`Turn dark mode ${darkMode ? 'off' : 'on'}`}
            >
                <span
                    className={cn(
                        'absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform',
                        darkMode ? 'translate-x-6' : 'translate-x-0'
                    )}
                />
            </button>
        </div>
    )
}

ThemePreferenceCard.displayName = 'ThemePreferenceCard'
