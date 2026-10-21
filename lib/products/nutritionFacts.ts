import type { Nutriments } from '@/lib/types'

export const NUTRIENT_FIELDS = [
    { key: 'energy_kcal', label: 'energy', unit: 'kcal' },
    { key: 'fat', label: 'fat', unit: 'g' },
    { key: 'saturated_fat', label: 'saturatedFat', unit: 'g' },
    { key: 'carbohydrates', label: 'carbohydrates', unit: 'g' },
    { key: 'sugars', label: 'sugars', unit: 'g' },
    { key: 'proteins', label: 'proteins', unit: 'g' },
    { key: 'salt', label: 'salt', unit: 'g' },
    { key: 'fiber', label: 'fiber', unit: 'g' },
] as const satisfies readonly {
    key: keyof Nutriments
    label: string
    unit: string
}[]

export function formatNutrientValue(
    value: number | undefined,
    unit: string
): string {
    return `${typeof value === 'number' && Number.isFinite(value) ? value.toFixed(1) : '–'} ${unit}`
}
