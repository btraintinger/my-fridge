import type { FridgeItem } from '@/lib/types'

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

const NUTRI_SCORE_WEIGHTS: Record<string, number> = {
    a: 100,
    b: 75,
    c: 50,
    d: 25,
    e: 0,
}

const GOOD_GRADES = new Set(['a', 'b'])
const BAD_GRADES = new Set(['d', 'e'])
const RECOMMENDATION_THRESHOLD = 0.3

export function calculateHealthScore(items: FridgeItem[]): HealthScoreResult {
    if (items.length === 0) {
        return {
            score: 0,
            recommendations: ['fridges.analysis.recommendation.addProducts'],
            breakdown: { nutriScorePoints: 0 },
        }
    }

    const recommendations: HealthScoreRecommendationKey[] = []
    const grades = items
        .map((item) => item.product.nutriscore_grade?.toLowerCase())
        .filter((grade): grade is string => Boolean(grade))
    let nutriScorePoints = 50

    if (grades.length > 0) {
        const totalNutriWeight = grades.reduce(
            (sum, grade) => sum + (NUTRI_SCORE_WEIGHTS[grade] ?? 50),
            0
        )
        nutriScorePoints = Math.round(totalNutriWeight / grades.length)

        const badGradeCount = grades.filter((grade) =>
            BAD_GRADES.has(grade)
        ).length
        if (badGradeCount > grades.length * RECOMMENDATION_THRESHOLD) {
            recommendations.push('fridges.analysis.recommendation.reduceDE')
        }

        const goodGradeCount = grades.filter((grade) =>
            GOOD_GRADES.has(grade)
        ).length
        if (goodGradeCount < grades.length * RECOMMENDATION_THRESHOLD) {
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
