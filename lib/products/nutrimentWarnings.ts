import type { Product } from '@/lib/types'

export interface NutrimentWarning {
    id: 'sugar' | 'salt' | 'fat' | 'saturated_fat' | 'energy'
    severity: 'medium' | 'high'
    value: number
    unit: string
    threshold: number
}

function toNumber(value: unknown): number | null {
    if (typeof value !== 'number' || Number.isNaN(value)) return null
    return value
}

const WARNING_RULES = [
    {
        id: 'sugar',
        nutriment: 'sugars',
        unit: 'g',
        mediumThreshold: 5,
        highThreshold: 22.5,
    },
    {
        id: 'salt',
        nutriment: 'salt',
        unit: 'g',
        mediumThreshold: 0.3,
        highThreshold: 1.5,
    },
    {
        id: 'fat',
        nutriment: 'fat',
        unit: 'g',
        mediumThreshold: 3,
        highThreshold: 17.5,
    },
    {
        id: 'saturated_fat',
        nutriment: 'saturated_fat',
        unit: 'g',
        mediumThreshold: 1.5,
        highThreshold: 5,
    },
    {
        id: 'energy',
        nutriment: 'energy_kcal',
        unit: 'kcal',
        mediumThreshold: 250,
        highThreshold: 400,
    },
] as const satisfies ReadonlyArray<{
    id: NutrimentWarning['id']
    nutriment: keyof NonNullable<Product['nutriments']>
    unit: string
    mediumThreshold: number
    highThreshold: number
}>

export function getNutrimentWarnings(product: Product): NutrimentWarning[] {
    return WARNING_RULES.flatMap((rule) => {
        const value = toNumber(product.nutriments?.[rule.nutriment])
        if (value === null || value <= rule.mediumThreshold) return []

        const severity = value > rule.highThreshold ? 'high' : 'medium'
        const threshold =
            severity === 'high' ? rule.highThreshold : rule.mediumThreshold

        return [
            {
                id: rule.id,
                severity,
                value,
                unit: rule.unit,
                threshold,
            },
        ]
    })
}
