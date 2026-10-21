import type { DietaryPreferences } from '@/lib/types'

export const DIETARY_PREFERENCE_KEYS = [
    'vegan',
    'vegetarian',
    'glutenFree',
    'lactoseFree',
    'nutFree',
    'kosher',
    'halal',
    'diabetes',
] as const satisfies readonly (keyof DietaryPreferences)[]

export type DietaryPreferenceKey = (typeof DIETARY_PREFERENCE_KEYS)[number]
type PreferenceLabelKey =
    `settings.sections.dietary.options.${DietaryPreferenceKey}`

export function formatAllergenMatches(
    matches: string[],
    translate: (key: PreferenceLabelKey) => string
): string[] {
    return matches.map((match) => {
        const key = DIETARY_PREFERENCE_KEYS.find((key) => key === match)
        return key
            ? translate(`settings.sections.dietary.options.${key}`)
            : match
    })
}

export function hasDietaryPreferences(
    preferences: DietaryPreferences
): boolean {
    return (
        preferences.allergies.length > 0 ||
        DIETARY_PREFERENCE_KEYS.some((key) => preferences[key])
    )
}
