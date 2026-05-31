'use client'

import { use, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    ChartNoAxesCombined,
    CircleAlert,
    Flame,
    ScanLine,
    ShieldAlert,
    Sparkles,
    TrendingDown,
    TrendingUp,
} from 'lucide-react'
import { useFridge } from '@/hooks/useFridges'
import { Button } from '@/components/ui/Button'
import { HealthScoreRing } from '@/components/fridge-details/HealthScoreRing'
import {
    NutriScoreBadge,
    NutriScoreDistribution,
} from '@/components/fridge-details/NutriScoreComponents'
import { calculateHealthScore } from '@/lib/healthScore'
import { analyzeFridge } from '@/lib/fridgeAnalytics'
import { getNutrimentWarnings } from '@/lib/nutrimentWarnings'

export default function FridgeAnalysisPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const t = useTranslations()
    const { fridge, items, loading, error } = useFridge(id)

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
                (sum, warning) => sum + (warning.severity === 'high' ? 20 : 10),
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
                warningLevel: warnings.filter(
                    (warning) => warning.severity === 'high'
                ).length,
            }
        })

        const warningStats = base.reduce(
            (acc, entry) => {
                for (const warning of entry.warnings) {
                    if (warning.severity === 'high') acc.high += 1
                    if (warning.severity === 'medium') acc.medium += 1
                }
                if (entry.warnings.length > 0) acc.products += 1
                return acc
            },
            { high: 0, medium: 0, products: 0 }
        )

        const bestProducts = [...base]
            .sort((a, b) => b.qualityScore - a.qualityScore)
            .slice(0, 5)

        const riskProducts = [...base]
            .filter(
                (entry) =>
                    entry.warningLevel > 0 ||
                    entry.grade === 'd' ||
                    entry.grade === 'e'
            )
            .sort((a, b) => {
                if (b.warningLevel !== a.warningLevel) {
                    return b.warningLevel - a.warningLevel
                }
                return a.qualityScore - b.qualityScore
            })
            .slice(0, 5)

        const withNutriScore = items.filter((item) => {
            const grade = item.product?.nutriscore_grade?.toLowerCase()
            return grade && ['a', 'b', 'c', 'd', 'e'].includes(grade)
        }).length

        const withNutriments = items.filter((item) => {
            const nutriments = item.product?.nutriments
            return (
                typeof nutriments?.energy_kcal === 'number' ||
                typeof nutriments?.fat === 'number' ||
                typeof nutriments?.sugars === 'number' ||
                typeof nutriments?.salt === 'number'
            )
        }).length

        return {
            bestProducts,
            riskProducts,
            warningStats,
            dataCoverage: {
                withNutriScore,
                withNutriments,
            },
        }
    }, [items])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 lg:pl-20 xl:pl-56">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
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
        <div className="flex-1 min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/10 pb-20 lg:pl-20 xl:pl-56">
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

            <div className="px-4 sm:px-6 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
                <div className="bg-slate-900 text-white rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 shadow-2xl shadow-slate-950/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.28),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_35%)]" />
                    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300/80 mb-2">
                                {t('fridges.analysis.overallHealth')}
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-black leading-tight max-w-lg">
                                {t('fridges.analysis.headline')}
                            </h2>
                            <p className="text-sm text-slate-300 mt-3 max-w-xl">
                                {t('fridges.analysis.subheadline')}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <HealthScoreRing score={healthScore.score} />
                            <div className="flex flex-col gap-2 items-start">
                                <NutriScoreBadge grade={analytics.nutriScore} />
                                <div className="text-xs text-slate-300">
                                    {t('fridges.analysis.modalNutriScore')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        icon={<BarChart3 size={18} />}
                        label={t('fridges.analysis.stats.items')}
                        value={String(analytics.totalItems)}
                    />
                    <StatCard
                        icon={<Sparkles size={18} />}
                        label={t('fridges.analysis.stats.totalQuantity')}
                        value={String(analytics.totalQuantity)}
                    />
                    <StatCard
                        icon={<TrendingUp size={18} />}
                        label={t('fridges.analysis.stats.avgQuantity')}
                        value={analytics.averageQuantity.toFixed(1)}
                    />
                    <StatCard
                        icon={<Flame size={18} />}
                        label={t('fridges.analysis.stats.expiringSoon')}
                        value={String(analytics.expiringSoonCount)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <SectionCard
                        title={t('fridges.analysis.warnings.title')}
                        subtitle={t('fridges.analysis.warnings.subtitle')}
                    >
                        <div className="grid grid-cols-3 gap-2">
                            <MiniStat
                                label={t('fridges.analysis.warnings.products')}
                                value={productInsights.warningStats.products}
                            />
                            <MiniStat
                                label={t('fridges.analysis.warnings.high')}
                                value={productInsights.warningStats.high}
                                tone="rose"
                            />
                            <MiniStat
                                label={t('fridges.analysis.warnings.medium')}
                                value={productInsights.warningStats.medium}
                                tone="amber"
                            />
                        </div>
                    </SectionCard>

                    <SectionCard
                        title={t('fridges.analysis.dataCoverage.title')}
                        subtitle={t('fridges.analysis.dataCoverage.subtitle')}
                    >
                        <div className="space-y-2">
                            <CoverageRow
                                label={t(
                                    'fridges.analysis.dataCoverage.nutriScore'
                                )}
                                value={
                                    productInsights.dataCoverage.withNutriScore
                                }
                                total={items.length}
                            />
                            <CoverageRow
                                label={t(
                                    'fridges.analysis.dataCoverage.nutriments'
                                )}
                                value={
                                    productInsights.dataCoverage.withNutriments
                                }
                                total={items.length}
                            />
                        </div>
                    </SectionCard>

                    <SectionCard
                        title={t('fridges.analysis.quickSignal.title')}
                        subtitle={t('fridges.analysis.quickSignal.subtitle')}
                    >
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-white/90 dark:bg-slate-900/70">
                            {productInsights.warningStats.high > 0 ? (
                                <ShieldAlert
                                    size={20}
                                    className="text-rose-500"
                                />
                            ) : (
                                <ChartNoAxesCombined
                                    size={20}
                                    className="text-emerald-500"
                                />
                            )}
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                                {productInsights.warningStats.high > 0
                                    ? t(
                                          'fridges.analysis.quickSignal.highWarnings'
                                      )
                                    : t('fridges.analysis.quickSignal.ok')}
                            </p>
                        </div>
                    </SectionCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SectionCard
                        title={t('fridges.analysis.nutriSpread.title')}
                        subtitle={t('fridges.analysis.nutriSpread.subtitle')}
                    >
                        <NutriScoreDistribution items={items} />
                    </SectionCard>

                    <SectionCard
                        title={t('fridges.analysis.dietary.title')}
                        subtitle={t('fridges.analysis.dietary.subtitle')}
                    >
                        <div className="grid grid-cols-3 gap-3">
                            <MiniStat
                                label={t('fridges.analysis.dietary.vegan')}
                                value={analytics.veganCount}
                            />
                            <MiniStat
                                label={t('fridges.analysis.dietary.vegetarian')}
                                value={analytics.vegetarianCount}
                            />
                            <MiniStat
                                label={t(
                                    'fridges.analysis.dietary.palmOilFree'
                                )}
                                value={analytics.palmOilFreeCount}
                            />
                        </div>
                    </SectionCard>
                </div>

                <SectionCard
                    title={t('fridges.analysis.avgNutrition.title')}
                    subtitle={t('fridges.analysis.avgNutrition.subtitle')}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        {analytics.averageNutriments.map((entry) => (
                            <div
                                key={entry.key}
                                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-4"
                            >
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    {entry.label}
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                                    {entry.value === null
                                        ? '-'
                                        : entry.value.toFixed(1)}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {t('fridges.analysis.avgNutrition.per100g')}
                                </p>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <SectionCard
                        title={t('fridges.analysis.best.title')}
                        subtitle={t('fridges.analysis.best.subtitle')}
                    >
                        {productInsights.bestProducts.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('fridges.analysis.best.empty')}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {productInsights.bestProducts.map((entry) => (
                                    <ProductInsightRow
                                        key={entry.item.id}
                                        name={entry.item.product.product_name}
                                        brand={entry.item.product.brands}
                                        grade={
                                            entry.item.product.nutriscore_grade
                                        }
                                        warnings={entry.warnings.length}
                                        warningLabel={t(
                                            'fridges.analysis.warningCount',
                                            { count: entry.warnings.length }
                                        )}
                                        trend="up"
                                    />
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        title={t('fridges.analysis.needsAttention.title')}
                        subtitle={t('fridges.analysis.needsAttention.subtitle')}
                    >
                        {productInsights.riskProducts.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('fridges.analysis.needsAttention.empty')}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {productInsights.riskProducts.map((entry) => (
                                    <ProductInsightRow
                                        key={entry.item.id}
                                        name={entry.item.product.product_name}
                                        brand={entry.item.product.brands}
                                        grade={
                                            entry.item.product.nutriscore_grade
                                        }
                                        warnings={entry.warnings.length}
                                        warningLabel={t(
                                            'fridges.analysis.warningCount',
                                            { count: entry.warnings.length }
                                        )}
                                        trend="down"
                                    />
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>

                {productInsights.riskProducts.length > 0 && (
                    <SectionCard
                        title={t('fridges.analysis.warningDetails.title')}
                        subtitle={t('fridges.analysis.warningDetails.subtitle')}
                    >
                        <div className="space-y-3">
                            {productInsights.riskProducts.map((entry) => (
                                <div
                                    key={`${entry.item.id}-warnings`}
                                    className="rounded-2xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-3"
                                >
                                    <p className="font-semibold text-rose-900 dark:text-rose-200 text-sm">
                                        {entry.item.product.product_name}
                                    </p>
                                    {entry.warnings.length === 0 ? (
                                        <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                                            {t(
                                                'fridges.analysis.warningDetails.lowNutri'
                                            )}
                                        </p>
                                    ) : (
                                        <div className="mt-1 space-y-1">
                                            {entry.warnings
                                                .slice(0, 2)
                                                .map((warning) => (
                                                    <p
                                                        key={`${entry.item.id}-${warning.id}`}
                                                        className="text-xs text-rose-700 dark:text-rose-300"
                                                    >
                                                        <CircleAlert
                                                            size={12}
                                                            className="inline mr-1"
                                                        />
                                                        {t(
                                                            `nutrimentWarnings.${warning.id}.label` as never
                                                        )}
                                                        :{' '}
                                                        {warning.value.toFixed(
                                                            1
                                                        )}{' '}
                                                        {warning.unit} -{' '}
                                                        {t(
                                                            `nutrimentWarnings.${warning.id}.${warning.severity}` as never
                                                        )}
                                                    </p>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                <SectionCard
                    title={t('fridges.analysis.topBrands.title')}
                    subtitle={t('fridges.analysis.topBrands.subtitle')}
                >
                    {analytics.topBrands.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('fridges.analysis.topBrands.empty')}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {analytics.topBrands.map((brand) => (
                                <div
                                    key={brand.name}
                                    className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 px-4 py-3"
                                >
                                    <span className="font-semibold text-slate-800 dark:text-slate-100 truncate pr-3">
                                        {brand.name}
                                    </span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        {brand.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title={t('fridges.analysis.recommendation.title')}
                    subtitle={t('fridges.analysis.recommendation.subtitle')}
                >
                    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-900/50 p-4">
                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                            {t(healthScore.recommendations[0] as never)}
                        </p>
                    </div>
                </SectionCard>

                <div className="flex justify-end">
                    <Link href={`/fridges/${id}`}>
                        <Button variant="outline" className="rounded-xl">
                            {t('fridges.analysis.backToFridge')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

function SectionCard({
    title,
    subtitle,
    children,
}: {
    title: string
    subtitle?: string
    children: React.ReactNode
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur p-5 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
            {children}
        </div>
    )
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="rounded-[1.2rem] sm:rounded-[1.5rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {label}
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
                    {value}
                </p>
            </div>
        </div>
    )
}

function MiniStat({
    label,
    value,
    tone = 'emerald',
}: {
    label: string
    value: number
    tone?: 'emerald' | 'rose' | 'amber'
}) {
    const toneClasses: Record<string, string> = {
        emerald:
            'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20',
        rose: 'border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20',
        amber: 'border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20',
    }

    return (
        <div
            className={`rounded-2xl border p-3 text-center ${toneClasses[tone]}`}
        >
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
                {value}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                {label}
            </div>
        </div>
    )
}

function CoverageRow({
    label,
    value,
    total,
}: {
    label: string
    value: number
    total: number
}) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {label}
                </span>
                <span className="text-xs font-bold text-slate-400">
                    {value}/{total}
                </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function ProductInsightRow({
    name,
    brand,
    grade,
    warnings,
    warningLabel,
    trend,
}: {
    name: string
    brand?: string
    grade?: string | null
    warnings: number
    warningLabel: string
    trend: 'up' | 'down'
}) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 px-3 py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate">
                    {name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {brand || '-'}
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {warnings > 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {warningLabel}
                    </span>
                )}
                <NutriScoreBadge grade={grade ?? '-'} size="sm" />
                {trend === 'up' ? (
                    <TrendingUp size={16} className="text-emerald-500" />
                ) : (
                    <TrendingDown size={16} className="text-rose-500" />
                )}
            </div>
        </div>
    )
}
