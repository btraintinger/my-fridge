import { useTranslations } from 'next-intl'
import { SectionCard } from '@/components/layout/SectionCard'
import type { FridgeAnalytics } from '@/lib/fridges/fridgeAnalytics'
import { MiniStat } from '@/components/fridges/analysis/Stats'
import { NutriScoreDistribution } from '@/components/products/NutriScore'
import type { FridgeItem } from '@/lib/types'

export function AvgNutrition({
    averageNutriments,
}: {
    averageNutriments: FridgeAnalytics['averageNutriments']
}) {
    const t = useTranslations('fridges.analysis.avgNutrition')
    const tNutrients = useTranslations('nutrients')
    return (
        <SectionCard title={t('title')} subtitle={t('subtitle')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {averageNutriments.map((entry) => (
                    <div
                        key={entry.key}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-4"
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            {tNutrients(entry.key)}
                        </p>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                            {entry.value === null
                                ? '-'
                                : entry.value.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {t('per100g')}
                        </p>
                    </div>
                ))}
            </div>
        </SectionCard>
    )
}

export function DietaryFlags({
    analytics,
}: {
    analytics: Pick<
        FridgeAnalytics,
        'veganCount' | 'vegetarianCount' | 'palmOilFreeCount'
    >
}) {
    const t = useTranslations('fridges.analysis.dietary')
    return (
        <SectionCard title={t('title')} subtitle={t('subtitle')}>
            <div className="grid grid-cols-3 gap-3">
                <MiniStat label={t('vegan')} value={analytics.veganCount} />
                <MiniStat
                    label={t('vegetarian')}
                    value={analytics.vegetarianCount}
                />
                <MiniStat
                    label={t('palmOilFree')}
                    value={analytics.palmOilFreeCount}
                />
            </div>
        </SectionCard>
    )
}

export function NutriSpread({ items }: { items: FridgeItem[] }) {
    const t = useTranslations('fridges.analysis.nutriSpread')
    return (
        <SectionCard title={t('title')} subtitle={t('subtitle')}>
            <NutriScoreDistribution items={items} />
        </SectionCard>
    )
}
