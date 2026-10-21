'use client'

import { PageShell } from '@/components/layout/Page'
import { use, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { AlertCircle, ArrowLeft, BarChart3, ScanLine } from 'lucide-react'
import { useFridge } from '@/components/fridges/useFridges'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/feedback/Spinner'
import { calculateHealthScore } from '@/lib/fridges/healthScore'
import { analyzeFridge } from '@/lib/fridges/fridgeAnalytics'
import { getNutrimentWarnings } from '@/lib/products/nutrimentWarnings'
import { getMatchingAllergens } from '@/lib/products/allergenWarnings'
import {
    formatAllergenMatches,
    hasDietaryPreferences,
} from '@/lib/products/dietaryPreferences'
import {
    HealthHero,
    StatsGrid,
    Recommendation,
} from '@/components/fridges/analysis/Overview'
import {
    WarningOverview,
    NutrimentWarningDetails,
    AllergenAlerts,
} from '@/components/fridges/analysis/Warnings'
import {
    NutriSpread,
    DietaryFlags,
    AvgNutrition,
} from '@/components/fridges/analysis/Nutrition'
import {
    BestProducts,
    NeedsAttention,
    TopBrands,
} from '@/components/fridges/analysis/Products'

export default function FridgeAnalysisPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const t = useTranslations()
    const { fridge, items, loading, error } = useFridge(id)
    const { dietaryPreferences } = useUserPreferences()

    const healthScore = calculateHealthScore(items)
    const analytics = analyzeFridge(items)

    const productInsights = useMemo(() => {
        const gradeWeights: Record<string, number> = {
            a: 100,
            b: 80,
            c: 60,
            d: 35,
            e: 10,
            '-': 45,
            unknown: 45,
        }

        const base = items.map((item) => {
            const grade = item.product?.nutriscore_grade?.toLowerCase() ?? '-'
            const warnings = getNutrimentWarnings(item.product)
            const warningPenalty = warnings.reduce(
                (sum, w) => sum + (w.severity === 'high' ? 20 : 10),
                0
            )
            const qualityScore =
                (gradeWeights[grade] ?? 45) -
                warningPenalty +
                (item.product?.dietary_flags?.vegan ? 8 : 0) +
                (item.product?.dietary_flags?.palm_oil_free ? 4 : 0)

            return {
                item,
                grade,
                warnings,
                qualityScore,
                warningLevel: warnings.filter((w) => w.severity === 'high')
                    .length,
            }
        })

        const warningStats = base.reduce(
            (acc, entry) => {
                for (const w of entry.warnings) {
                    if (w.severity === 'high') acc.high += 1
                    if (w.severity === 'medium') acc.medium += 1
                }
                if (entry.warnings.length > 0) acc.products += 1
                return acc
            },
            { high: 0, medium: 0, products: 0 }
        )

        return {
            bestProducts: [...base]
                .sort((a, b) => b.qualityScore - a.qualityScore)
                .slice(0, 5),
            riskProducts: [...base]
                .filter(
                    (e) =>
                        e.warningLevel > 0 || e.grade === 'd' || e.grade === 'e'
                )
                .sort((a, b) =>
                    b.warningLevel !== a.warningLevel
                        ? b.warningLevel - a.warningLevel
                        : a.qualityScore - b.qualityScore
                )
                .slice(0, 5),
            warningStats,
            dataCoverage: {
                withNutriScore: items.filter((item) => {
                    const grade = item.product?.nutriscore_grade?.toLowerCase()
                    return grade && ['a', 'b', 'c', 'd', 'e'].includes(grade)
                }).length,
                withNutriments: items.filter((item) => {
                    const n = item.product?.nutriments
                    return (
                        typeof n?.energy_kcal === 'number' ||
                        typeof n?.fat === 'number' ||
                        typeof n?.sugars === 'number' ||
                        typeof n?.salt === 'number'
                    )
                }).length,
            },
        }
    }, [items])

    const allergenItems = useMemo(() => {
        if (!hasDietaryPreferences(dietaryPreferences)) return null

        return items
            .map((item) => ({
                item,
                matches: formatAllergenMatches(
                    getMatchingAllergens(item.product, dietaryPreferences),
                    t
                ),
            }))
            .filter((entry) => entry.matches.length > 0)
    }, [items, dietaryPreferences, t])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 lg:pl-20 xl:pl-56">
                <Spinner size="lg" />
            </div>
        )
    }

    if (error || !fridge) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center lg:pl-20 xl:pl-56">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-inner">
                    <AlertCircle size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                    {t('common.oops')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
                    {error || t('fridges.detail.fridgeNotFound')}
                </p>
                <Link href="/fridges">
                    <Button variant="outline">
                        {t('fridges.detail.backToFridges')}
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <PageShell className="block bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/10">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 border-b border-white/70 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl pt-safe">
                <div className="pt-12 px-4 sm:px-6 pb-5 flex items-center gap-3">
                    <Link
                        href={`/fridges/${id}`}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 shrink-0"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <BarChart3 size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                            {t('fridges.analysis.title')}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {fridge.name}
                        </p>
                    </div>
                    <Link href="/scanner" className="shrink-0">
                        <Button size="sm" className="rounded-xl">
                            <ScanLine size={18} className="mr-1" />{' '}
                            {t('fridges.detail.addButton')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
                <HealthHero
                    healthScore={healthScore}
                    nutriScore={analytics.nutriScore}
                />
                <StatsGrid analytics={analytics} />
                <WarningOverview
                    warningStats={productInsights.warningStats}
                    dataCoverage={productInsights.dataCoverage}
                    totalItems={items.length}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <NutriSpread items={items} />
                    <DietaryFlags analytics={analytics} />
                </div>
                <AvgNutrition averageNutriments={analytics.averageNutriments} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <BestProducts entries={productInsights.bestProducts} />
                    <NeedsAttention entries={productInsights.riskProducts} />
                </div>
                <NutrimentWarningDetails
                    entries={productInsights.riskProducts}
                />
                <AllergenAlerts allergenItems={allergenItems} />
                <TopBrands brands={analytics.topBrands} />
                <Recommendation
                    recommendation={t(healthScore.recommendations[0] as never)}
                />
            </div>
        </PageShell>
    )
}
