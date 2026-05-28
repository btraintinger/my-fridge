import type { Product } from './types'

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

export function getNutrimentWarnings(product: Product): NutrimentWarning[] {
    const nm = product.nutriments
    const warnings: NutrimentWarning[] = []

    const sugars = toNumber(nm?.sugars)
    if (sugars !== null) {
        if (sugars > 22.5) {
            warnings.push({ id: 'sugar', severity: 'high', value: sugars, unit: 'g', threshold: 22.5 })
        } else if (sugars > 5) {
            warnings.push({ id: 'sugar', severity: 'medium', value: sugars, unit: 'g', threshold: 5 })
        }
    }

    const salt = toNumber(nm?.salt)
    if (salt !== null) {
        if (salt > 1.5) {
            warnings.push({ id: 'salt', severity: 'high', value: salt, unit: 'g', threshold: 1.5 })
        } else if (salt > 0.3) {
            warnings.push({ id: 'salt', severity: 'medium', value: salt, unit: 'g', threshold: 0.3 })
        }
    }

    const fat = toNumber(nm?.fat)
    if (fat !== null) {
        if (fat > 17.5) {
            warnings.push({ id: 'fat', severity: 'high', value: fat, unit: 'g', threshold: 17.5 })
        } else if (fat > 3) {
            warnings.push({ id: 'fat', severity: 'medium', value: fat, unit: 'g', threshold: 3 })
        }
    }

    const saturatedFat = toNumber(nm?.saturated_fat)
    if (saturatedFat !== null) {
        if (saturatedFat > 5) {
            warnings.push({ id: 'saturated_fat', severity: 'high', value: saturatedFat, unit: 'g', threshold: 5 })
        } else if (saturatedFat > 1.5) {
            warnings.push({ id: 'saturated_fat', severity: 'medium', value: saturatedFat, unit: 'g', threshold: 1.5 })
        }
    }

    const energy = toNumber(nm?.energy_kcal)
    if (energy !== null) {
        if (energy > 400) {
            warnings.push({ id: 'energy', severity: 'high', value: energy, unit: 'kcal', threshold: 400 })
        } else if (energy > 250) {
            warnings.push({ id: 'energy', severity: 'medium', value: energy, unit: 'kcal', threshold: 250 })
        }
    }

    return warnings
}
