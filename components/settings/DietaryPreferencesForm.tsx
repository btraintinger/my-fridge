'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, Plus, X, UtensilsCrossed } from 'lucide-react'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { Button, cn } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const PREFERENCE_KEYS = [
    'vegan',
    'vegetarian',
    'glutenFree',
    'lactoseFree',
    'nutFree',
    'kosher',
    'halal',
    'diabetes',
] as const

type PreferenceKey = (typeof PREFERENCE_KEYS)[number]

export function DietaryPreferencesForm() {
    const t = useTranslations('settings.sections.dietary')
    const { dietaryPreferences, updateDietaryPreferences, loading } =
        useUserPreferences()
    const [newAllergy, setNewAllergy] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const togglePreference = async (key: PreferenceKey) => {
        setIsSaving(true)
        try {
            await updateDietaryPreferences({ [key]: !dietaryPreferences[key] })
        } finally {
            setIsSaving(false)
        }
    }

    const addAllergy = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const trimmed = newAllergy.trim()
        if (!trimmed) return

        const currentAllergies = dietaryPreferences.allergies || []
        if (currentAllergies.includes(trimmed)) {
            setNewAllergy('')
            return
        }

        setIsSaving(true)
        try {
            await updateDietaryPreferences({
                allergies: [...currentAllergies, trimmed],
            })
            setNewAllergy('')
        } finally {
            setIsSaving(false)
        }
    }

    const removeAllergy = async (allergyToRemove: string) => {
        const currentAllergies = dietaryPreferences.allergies || []
        setIsSaving(true)
        try {
            await updateDietaryPreferences({
                allergies: currentAllergies.filter(
                    (a) => a !== allergyToRemove
                ),
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
            </div>
        )
    }

    const allergies = dietaryPreferences.allergies ?? []
    const activeCount =
        PREFERENCE_KEYS.filter((k) => dietaryPreferences[k]).length +
        allergies.length

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Collapsible header */}
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((v) => !v)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 dark:hover:bg-slate-800/40 sm:p-5"
            >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <UtensilsCrossed size={20} />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">
                        {t('title')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {activeCount > 0
                            ? t('activeCount', { count: activeCount })
                            : t('description')}
                    </p>
                </div>
                <ChevronDown
                    size={20}
                    className={cn(
                        'shrink-0 text-slate-400 transition-transform dark:text-slate-500',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <>
                    {/* Preference switches */}
                    <div className="border-t border-slate-100 dark:border-slate-800">
                        {PREFERENCE_KEYS.map((key) => {
                            const active = Boolean(dietaryPreferences[key])
                            return (
                                <div
                                    key={key}
                                    className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-800 sm:px-5"
                                >
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {t(`options.${key}`)}
                                    </span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={active}
                                        aria-label={t(`options.${key}`)}
                                        disabled={isSaving}
                                        onClick={() =>
                                            void togglePreference(key)
                                        }
                                        className={cn(
                                            'relative h-6 w-11 flex-none overflow-hidden rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-0 disabled:opacity-50',
                                            active
                                                ? 'bg-emerald-500'
                                                : 'bg-slate-200 dark:bg-slate-700'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                                                active
                                                    ? 'translate-x-5'
                                                    : 'translate-x-0'
                                            )}
                                        />
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    {/* Custom allergies */}
                    <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5 sm:py-5">
                        <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {t('allergies.title')}
                        </h4>

                        <form onSubmit={addAllergy} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder={t('allergies.placeholder')}
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                disabled={isSaving}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={isSaving || !newAllergy.trim()}
                            >
                                <Plus size={18} className="mr-1" />
                                {t('allergies.add')}
                            </Button>
                        </form>

                        {allergies.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {allergies.map((allergy) => (
                                    <span
                                        key={allergy}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 py-1 pl-3 pr-1 text-sm font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    >
                                        {allergy}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void removeAllergy(allergy)
                                            }
                                            disabled={isSaving}
                                            className="flex h-5 w-5 items-center justify-center rounded-full text-emerald-600/70 transition-colors hover:bg-emerald-100 hover:text-red-600 disabled:opacity-50 dark:text-emerald-300/70 dark:hover:bg-emerald-900/50 dark:hover:text-red-400"
                                            aria-label={t('allergies.remove')}
                                            title={t('allergies.remove')}
                                        >
                                            <X size={13} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm italic text-slate-500 dark:text-slate-400">
                                {t('allergies.empty')}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
