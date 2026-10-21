import { useTranslations } from 'next-intl'
import { NutriScoreBadge } from '@/components/products/NutriScore'
import type { HealthScoreResult } from '@/lib/fridges/healthScore'
import { BarChart3, Flame, Sparkles, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/fridges/analysis/Stats'
import type { FridgeAnalytics } from '@/lib/fridges/fridgeAnalytics'
import { SectionCard } from '@/components/layout/SectionCard'

export function HealthHero({
    healthScore,
    nutriScore,
}: {
    healthScore: HealthScoreResult
    nutriScore: string | null
}) {
    const t = useTranslations('fridges.analysis')
    return (
        <div className="bg-slate-900 text-white rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 shadow-2xl shadow-slate-950/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.28),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_35%)]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300/80 mb-2">
                        {t('overallHealth')}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-black leading-tight max-w-lg">
                        {t('headline')}
                    </h2>
                    <p className="text-sm text-slate-300 mt-3 max-w-xl">
                        {t('subheadline')}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <HealthScoreRing score={healthScore.score} />
                    <div className="flex flex-col gap-2 items-start">
                        <NutriScoreBadge grade={nutriScore ?? '-'} />
                        <div className="text-xs text-slate-300">
                            {t('modalNutriScore')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function StatsGrid({
    analytics,
}: {
    analytics: Pick<
        FridgeAnalytics,
        'totalItems' | 'totalQuantity' | 'averageQuantity' | 'expiringSoonCount'
    >
}) {
    const t = useTranslations('fridges.analysis.stats')
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
                icon={<BarChart3 size={18} />}
                label={t('items')}
                value={String(analytics.totalItems)}
            />
            <StatCard
                icon={<Sparkles size={18} />}
                label={t('totalQuantity')}
                value={String(analytics.totalQuantity)}
            />
            <StatCard
                icon={<TrendingUp size={18} />}
                label={t('avgQuantity')}
                value={analytics.averageQuantity.toFixed(1)}
            />
            <StatCard
                icon={<Flame size={18} />}
                label={t('expiringSoon')}
                value={String(analytics.expiringSoonCount)}
            />
        </div>
    )
}

export function Recommendation({ recommendation }: { recommendation: string }) {
    const t = useTranslations('fridges.analysis.recommendation')
    return (
        <SectionCard title={t('title')} subtitle={t('subtitle')}>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-900/50 p-4">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    {recommendation}
                </p>
            </div>
        </SectionCard>
    )
}

function HealthScoreRing({ score }: { score: number }) {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="128" height="128" viewBox="0 0 128 128">
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800 opacity-30"
                    strokeWidth="10"
                />
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 64 64)"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-inherit">{score}</span>
                <span className="text-xs font-semibold opacity-60 uppercase">
                    / 100
                </span>
            </div>
        </div>
    )
}
