import { NUTRI_GRADES } from '@/lib/constants'
import type { FridgeItem } from '@/lib/types'

type NutrimentKey =
    | 'energy_kcal'
    | 'fat'
    | 'saturated_fat'
    | 'carbohydrates'
    | 'sugars'
    | 'proteins'
    | 'salt'
    | 'fiber'

export interface FridgeAnalytics {
    totalItems: number
    totalQuantity: number
    averageQuantity: number
    expiringSoonCount: number
    nutriScoreCounts: Record<string, number>
    nutriScore: string | null
    veganCount: number
    vegetarianCount: number
    palmOilFreeCount: number
    topBrands: Array<{ name: string; count: number }>
    averageNutriments: Array<{
        key: NutrimentKey
        value: number | null
        unit: string
    }>
}

function normalizeGrade(value: string | null | undefined) {
    const grade = value?.toLowerCase()
    return grade && NUTRI_GRADES.some((entry) => entry.grade === grade)
        ? grade
        : null
}

function average(values: number[]) {
    if (values.length === 0) return null
    return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function analyzeFridge(items: FridgeItem[]): FridgeAnalytics {
    const totalItems = items.length
    const totalQuantity = items.reduce(
        (sum, item) => sum + (item.quantity ?? 1),
        0
    )
    const expiringSoonCount = items.filter((item) => {
        if (!item.expiryDate) return false
        const expiry = new Date(item.expiryDate)
        if (Number.isNaN(expiry.getTime())) return false
        const today = new Date()
        const inSevenDays = new Date()
        inSevenDays.setDate(today.getDate() + 7)
        return expiry >= today && expiry <= inSevenDays
    }).length

    const nutriScoreCounts = Object.fromEntries(
        NUTRI_GRADES.map((grade) => [grade.grade, 0])
    ) as Record<string, number>

    const scoreGrades = items
        .map((item) => normalizeGrade(item.product?.nutriscore_grade))
        .filter((grade): grade is string => Boolean(grade))

    for (const grade of scoreGrades) {
        nutriScoreCounts[grade] = (nutriScoreCounts[grade] ?? 0) + 1
    }

    const productsWithScore = items.filter((item) =>
        normalizeGrade(item.product?.nutriscore_grade)
    )
    const nutriScore =
        productsWithScore.length > 0
            ? Object.entries(nutriScoreCounts).reduce((best, current) =>
                  current[1] > best[1] ? current : best
              )[0]
            : '-'

    const veganCount = items.filter(
        (item) => item.product?.dietary_flags?.vegan === true
    ).length
    const vegetarianCount = items.filter(
        (item) => item.product?.dietary_flags?.vegetarian === true
    ).length
    const palmOilFreeCount = items.filter(
        (item) => item.product?.dietary_flags?.palm_oil_free === true
    ).length

    const brandCounts = new Map<string, number>()
    for (const item of items) {
        const brand = item.product?.brands?.trim()
        if (!brand || brand === '-') continue
        brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1)
    }

    const topBrands = Array.from(brandCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    const nutrimentKeys: Array<{
        key: NutrimentKey
        unit: string
    }> = [
        { key: 'energy_kcal', unit: 'kcal' },
        { key: 'fat', unit: 'g' },
        { key: 'saturated_fat', unit: 'g' },
        { key: 'sugars', unit: 'g' },
        { key: 'proteins', unit: 'g' },
        { key: 'salt', unit: 'g' },
        { key: 'fiber', unit: 'g' },
    ]

    const averageNutriments = nutrimentKeys.map(({ key, unit }) => {
        const values = items
            .map((item) => item.product?.nutriments?.[key])
            .filter(
                (value): value is number =>
                    typeof value === 'number' && value > 0
            )

        return {
            key,
            unit,
            value: average(values),
        }
    })

    return {
        totalItems,
        totalQuantity,
        averageQuantity: totalItems > 0 ? totalQuantity / totalItems : 0,
        expiringSoonCount,
        nutriScoreCounts,
        nutriScore,
        veganCount,
        vegetarianCount,
        palmOilFreeCount,
        topBrands,
        averageNutriments,
    }
}
