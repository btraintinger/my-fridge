'use client'

import { TooltipButton } from '@/components/feedback/TooltipButton'

import {
    SettingsCollapsibleCard,
    SettingsSwitchRow,
} from '@/components/settings/SettingsCard'

import { Spinner } from '@/components/feedback/Spinner'
import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, X, UtensilsCrossed } from 'lucide-react'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
    DIETARY_PREFERENCE_KEYS as PREFERENCE_KEYS,
    type DietaryPreferenceKey as PreferenceKey,
} from '@/lib/products/dietaryPreferences'

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
                <Spinner className="mx-auto h-8 w-8" />
            </div>
        )
    }

    const allergies = dietaryPreferences.allergies ?? []
    const activeCount =
        PREFERENCE_KEYS.filter((k) => dietaryPreferences[k]).length +
        allergies.length

    return (
        <SettingsCollapsibleCard
            open={isOpen}
            onOpenChange={setIsOpen}
            icon={UtensilsCrossed}
            title={t('title')}
            summary={
                activeCount > 0
                    ? t('activeCount', { count: activeCount })
                    : t('description')
            }
        >
            {/* Preference switches */}
            <div className="border-t border-slate-100 dark:border-slate-800">
                {PREFERENCE_KEYS.map((key) => (
                    <SettingsSwitchRow
                        key={key}
                        label={t(`options.${key}`)}
                        checked={Boolean(dietaryPreferences[key])}
                        disabled={isSaving}
                        onCheckedChange={() => void togglePreference(key)}
                    />
                ))}
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
                                <TooltipButton
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={() => void removeAllergy(allergy)}
                                    disabled={isSaving}
                                    className="flex h-5 w-5 items-center justify-center rounded-full text-emerald-600/70 transition-colors hover:bg-emerald-100 hover:text-red-600 disabled:opacity-50 dark:text-emerald-300/70 dark:hover:bg-emerald-900/50 dark:hover:text-red-400"
                                    aria-label={t('allergies.remove')}
                                    tooltip={t('allergies.remove')}
                                >
                                    <X size={13} />
                                </TooltipButton>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="mt-3 text-sm italic text-slate-500 dark:text-slate-400">
                        {t('allergies.empty')}
                    </p>
                )}
            </div>
        </SettingsCollapsibleCard>
    )
}
