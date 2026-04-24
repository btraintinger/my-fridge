/**
 * Calculates a Health Score (0–100) for a fridge based on its items.
 *
 * Factors:
 * - Nutri-Score distribution (A/B = good, D/E = bad)
 */

import type { FridgeItem } from './types'

export interface HealthScoreResult {
    score: number
    recommendations: string[]
    breakdown: {
        nutriScorePoints: number
    }
}

export function calculateHealthScore(items: FridgeItem[]): HealthScoreResult {
    if (items.length === 0) {
        return {
            score: 0,
            recommendations: [
                'Add products to your fridge to get a health score.',
            ],
            breakdown: { nutriScorePoints: 0 },
        }
    }

    const recommendations: string[] = []

    // 1. Nutri-Score distribution (0–100 points)
    const nutriscoreWeights: Record<string, number> = {
        a: 100,
        b: 75,
        c: 50,
        d: 25,
        e: 0,
    }
    const itemsWithNutriscore = items.filter((i) => i.product.nutriscore_grade)
    let nutriScorePoints = 50 // default if no data

    if (itemsWithNutriscore.length > 0) {
        const totalNutriWeight = itemsWithNutriscore.reduce(
            (sum, item) =>
                sum +
                (nutriscoreWeights[
                    item.product.nutriscore_grade?.toLowerCase() ?? ''
                ] ?? 50),
            0
        )
        nutriScorePoints = Math.round(
            totalNutriWeight / itemsWithNutriscore.length
        )

        const badItems = itemsWithNutriscore.filter(
            (i) =>
                i.product.nutriscore_grade?.toLowerCase() === 'd' ||
                i.product.nutriscore_grade?.toLowerCase() === 'e'
        )
        if (badItems.length > itemsWithNutriscore.length * 0.3) {
            recommendations.push(
                'Try to reduce products with Nutri-Score D or E.'
            )
        }

        const goodItems = itemsWithNutriscore.filter(
            (i) =>
                i.product.nutriscore_grade?.toLowerCase() === 'a' ||
                i.product.nutriscore_grade?.toLowerCase() === 'b'
        )
        if (goodItems.length < itemsWithNutriscore.length * 0.3) {
            recommendations.push('Add more products with Nutri-Score A or B.')
        }
    }

    if (recommendations.length === 0) {
        recommendations.push('Great balance! Keep it up. 🎉')
    }

    const score = Math.min(100, Math.max(0, nutriScorePoints))

    return {
        score,
        recommendations,
        breakdown: { nutriScorePoints },
    }
}
