import type { Product } from './types'

export interface NutrimentWarning {
    id: 'sugar' | 'salt' | 'fat' | 'saturated_fat' | 'energy'
    severity: 'medium' | 'high'
    label: string
    value: number
    unit: string
    threshold: number
    message: string
}

function toNumber(value: unknown): number | null {
    if (typeof value !== 'number' || Number.isNaN(value)) return null
    return value
}

export function getNutrimentWarnings(product: Product): NutrimentWarning[] {
    const nm = product.nutriments
    const warnings: NutrimentWarning[] = []

    const sugars = toNumber(nm?.sugars)
    if (sugars !== null) {
        if (sugars > 22.5) {
            warnings.push({
                id: 'sugar',
                severity: 'high',
                label: 'Sugar',
                value: sugars,
                unit: 'g',
                threshold: 22.5,
                message: 'Very high sugar content (per 100g).',
            })
        } else if (sugars > 5) {
            warnings.push({
                id: 'sugar',
                severity: 'medium',
                label: 'Sugar',
                value: sugars,
                unit: 'g',
                threshold: 5,
                message: 'Moderately high sugar content (per 100g).',
            })
        }
    }

    const salt = toNumber(nm?.salt)
    if (salt !== null) {
        if (salt > 1.5) {
            warnings.push({
                id: 'salt',
                severity: 'high',
                label: 'Salt',
                value: salt,
                unit: 'g',
                threshold: 1.5,
                message: 'Very high salt content (per 100g).',
            })
        } else if (salt > 0.3) {
            warnings.push({
                id: 'salt',
                severity: 'medium',
                label: 'Salt',
                value: salt,
                unit: 'g',
                threshold: 0.3,
                message: 'Moderately high salt content (per 100g).',
            })
        }
    }

    const fat = toNumber(nm?.fat)
    if (fat !== null) {
        if (fat > 17.5) {
            warnings.push({
                id: 'fat',
                severity: 'high',
                label: 'Fat',
                value: fat,
                unit: 'g',
                threshold: 17.5,
                message: 'Very high fat content (per 100g).',
            })
        } else if (fat > 3) {
            warnings.push({
                id: 'fat',
                severity: 'medium',
                label: 'Fat',
                value: fat,
                unit: 'g',
                threshold: 3,
                message: 'Moderately high fat content (per 100g).',
            })
        }
    }

    const saturatedFat = toNumber(nm?.saturated_fat)
    if (saturatedFat !== null) {
        if (saturatedFat > 5) {
            warnings.push({
                id: 'saturated_fat',
                severity: 'high',
                label: 'Saturated fat',
                value: saturatedFat,
                unit: 'g',
                threshold: 5,
                message: 'Very high saturated fat content (per 100g).',
            })
        } else if (saturatedFat > 1.5) {
            warnings.push({
                id: 'saturated_fat',
                severity: 'medium',
                label: 'Saturated fat',
                value: saturatedFat,
                unit: 'g',
                threshold: 1.5,
                message: 'Moderately high saturated fat content (per 100g).',
            })
        }
    }

    const energy = toNumber(nm?.energy_kcal)
    if (energy !== null) {
        if (energy > 400) {
            warnings.push({
                id: 'energy',
                severity: 'high',
                label: 'Energy',
                value: energy,
                unit: 'kcal',
                threshold: 400,
                message: 'Very energy-dense (per 100g).',
            })
        } else if (energy > 250) {
            warnings.push({
                id: 'energy',
                severity: 'medium',
                label: 'Energy',
                value: energy,
                unit: 'kcal',
                threshold: 250,
                message: 'Moderately energy-dense (per 100g).',
            })
        }
    }

    return warnings
}
