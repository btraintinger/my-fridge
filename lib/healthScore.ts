import type { FridgeItem } from './types'

export type HealthScoreRecommendationKey =
    | 'fridges.analysis.recommendation.addProducts'
    | 'fridges.analysis.recommendation.reduceDE'
    | 'fridges.analysis.recommendation.addAB'
    | 'fridges.analysis.recommendation.great'

export interface HealthScoreResult {
    score: number
    recommendations: HealthScoreRecommendationKey[]
    breakdown: {
        nutriScorePoints: number
    }
}

export function calculateHealthScore(items: FridgeItem[]): HealthScoreResult {
    if (items.length === 0) {
        return {
            score: 0,
            recommendations: ['fridges.analysis.recommendation.addProducts'],
            breakdown: { nutriScorePoints: 0 },
        }
    }

    const recommendations: HealthScoreRecommendationKey[] = []

    const nutriscoreWeights: Record<string, number> = {
        a: 100,
        b: 75,
        c: 50,
        d: 25,
        e: 0,
    }
    const itemsWithNutriscore = items.filter((i) => i.product.nutriscore_grade)
    let nutriScorePoints = 50

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
            recommendations.push('fridges.analysis.recommendation.reduceDE')
        }

        const goodItems = itemsWithNutriscore.filter(
            (i) =>
                i.product.nutriscore_grade?.toLowerCase() === 'a' ||
                i.product.nutriscore_grade?.toLowerCase() === 'b'
        )
        if (goodItems.length < itemsWithNutriscore.length * 0.3) {
            recommendations.push('fridges.analysis.recommendation.addAB')
        }
    }

    if (recommendations.length === 0) {
        recommendations.push('fridges.analysis.recommendation.great')
    }

    const score = Math.min(100, Math.max(0, nutriScorePoints))

    return {
        score,
        recommendations,
        breakdown: { nutriScorePoints },
    }
}
