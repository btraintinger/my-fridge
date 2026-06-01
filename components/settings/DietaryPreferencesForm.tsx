'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, X, UtensilsCrossed } from 'lucide-react'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function DietaryPreferencesForm() {
    const t = useTranslations('settings.sections.dietary') // Assuming we will add translations
    const { dietaryPreferences, updateDietaryPreferences, loading } =
        useUserPreferences()
    const [newAllergy, setNewAllergy] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    const togglePreference = async (key: keyof typeof dietaryPreferences) => {
        if (key === 'allergies') return
        setIsSaving(true)
        try {
            await updateDietaryPreferences({ [key]: !dietaryPreferences[key] })
        } finally {
            setIsSaving(false)
        }
    }

    const addAllergy = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newAllergy.trim()) return

        const currentAllergies = dietaryPreferences.allergies || []
        if (currentAllergies.includes(newAllergy.trim())) {
            setNewAllergy('')
            return
        }

        setIsSaving(true)
        try {
            await updateDietaryPreferences({
                allergies: [...currentAllergies, newAllergy.trim()],
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

    const preferencesList = [
        { key: 'vegan', label: 'Vegan' },
        { key: 'vegetarian', label: 'Vegetarian' },
        { key: 'glutenFree', label: 'Gluten-Free' },
        { key: 'lactoseFree', label: 'Lactose-Free' },
        { key: 'nutFree', label: 'Nut-Free' },
        { key: 'kosher', label: 'Kosher' },
        { key: 'halal', label: 'Halal' },
        { key: 'diabetes', label: 'Diabetes' },
    ] as const

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <UtensilsCrossed size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">
                        {t('title', { defaultMessage: 'Dietary Preferences' })}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('description', {
                            defaultMessage:
                                'Set your dietary requirements to receive product warnings.',
                        })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preferencesList.map(({ key, label }) => (
                    <label
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            dietaryPreferences[key]
                                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                                : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={dietaryPreferences[key] as boolean}
                            onChange={() => togglePreference(key)}
                            disabled={isSaving}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                        />
                        <span
                            className={`font-medium ${dietaryPreferences[key] ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                            {t(`options.${key}`, { defaultMessage: label })}
                        </span>
                    </label>
                ))}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-slate-50 mb-4">
                    {t('allergies.title', {
                        defaultMessage: 'Custom Allergies',
                    })}
                </h4>

                <form onSubmit={addAllergy} className="flex gap-2 mb-4">
                    <Input
                        type="text"
                        placeholder={t('allergies.placeholder', {
                            defaultMessage: 'e.g. Shellfish, Peanuts...',
                        })}
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
                        {t('allergies.add', { defaultMessage: 'Add' })}
                    </Button>
                </form>

                {dietaryPreferences.allergies &&
                dietaryPreferences.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {dietaryPreferences.allergies.map((allergy) => (
                            <span
                                key={allergy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700"
                            >
                                {allergy}
                                <button
                                    onClick={() => removeAllergy(allergy)}
                                    disabled={isSaving}
                                    className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors"
                                    title={t('allergies.remove', {
                                        defaultMessage: 'Remove',
                                    })}
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic">
                        {t('allergies.empty', {
                            defaultMessage: 'No custom allergies added yet.',
                        })}
                    </p>
                )}
            </div>
        </div>
    )
}
