import { useTranslations } from 'next-intl'
import { ChartNoAxesCombined, ShieldAlert, CircleAlert } from 'lucide-react'
import { SectionCard } from '@/components/layout/SectionCard'
import { MiniStat, CoverageRow } from '@/components/fridges/analysis/Stats'
import type { ProductEntry } from '@/components/fridges/analysis/Products'
import type { FridgeItem } from '@/lib/types'

export function WarningOverview({
    warningStats,
    dataCoverage,
    totalItems,
}: {
    warningStats: { high: number; medium: number; products: number }
    dataCoverage: { withNutriScore: number; withNutriments: number }
    totalItems: number
}) {
    const t = useTranslations('fridges.analysis')
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <SectionCard
                title={t('warnings.title')}
                subtitle={t('warnings.subtitle')}
            >
                <div className="grid grid-cols-3 gap-2">
                    <MiniStat
                        label={t('warnings.products')}
                        value={warningStats.products}
                    />
                    <MiniStat
                        label={t('warnings.high')}
                        value={warningStats.high}
                        tone="rose"
                    />
                    <MiniStat
                        label={t('warnings.medium')}
                        value={warningStats.medium}
                        tone="amber"
                    />
                </div>
            </SectionCard>

            <SectionCard
                title={t('dataCoverage.title')}
                subtitle={t('dataCoverage.subtitle')}
            >
                <div className="space-y-2">
                    <CoverageRow
                        label={t('dataCoverage.nutriScore')}
                        value={dataCoverage.withNutriScore}
                        total={totalItems}
                    />
                    <CoverageRow
                        label={t('dataCoverage.nutriments')}
                        value={dataCoverage.withNutriments}
                        total={totalItems}
                    />
                </div>
            </SectionCard>

            <SectionCard
                title={t('quickSignal.title')}
                subtitle={t('quickSignal.subtitle')}
            >
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-white/90 dark:bg-slate-900/70">
                    {warningStats.high > 0 ? (
                        <ShieldAlert size={20} className="text-rose-500" />
                    ) : (
                        <ChartNoAxesCombined
                            size={20}
                            className="text-emerald-500"
                        />
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                        {warningStats.high > 0
                            ? t('quickSignal.highWarnings')
                            : t('quickSignal.ok')}
                    </p>
                </div>
            </SectionCard>
        </div>
    )
}

export function NutrimentWarningDetails({
    entries,
}: {
    entries: ProductEntry[]
}) {
    const t = useTranslations('fridges.analysis')
    if (entries.length === 0) return null
    return (
        <SectionCard
            title={t('warningDetails.title')}
            subtitle={t('warningDetails.subtitle')}
        >
            <div className="space-y-3">
                {entries.map((entry) => (
                    <div
                        key={`${entry.item.id}-warnings`}
                        className="rounded-2xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-3"
                    >
                        <p className="font-semibold text-rose-900 dark:text-rose-200 text-sm">
                            {entry.item.product.product_name}
                        </p>
                        {entry.warnings.length === 0 ? (
                            <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                                {t('warningDetails.lowNutri')}
                            </p>
                        ) : (
                            <div className="mt-1 space-y-1">
                                {entry.warnings.slice(0, 2).map((warning) => (
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
                                        : {warning.value.toFixed(1)}{' '}
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
    )
}

export function AllergenAlerts({
    allergenItems,
}: {
    allergenItems: { item: FridgeItem; matches: string[] }[] | null
}) {
    const t = useTranslations('fridges.analysis.allergenAlerts')
    return (
        <SectionCard title={t('title')} subtitle={t('subtitle')}>
            {allergenItems === null ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('noAllergies')}
                </p>
            ) : allergenItems.length === 0 ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                    {t('empty')}
                </p>
            ) : (
                <div className="space-y-2">
                    {allergenItems.map(({ item, matches }) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 p-3"
                        >
                            <p className="font-semibold text-rose-900 dark:text-rose-200 text-sm">
                                {item.product.product_name}
                            </p>
                            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                                <CircleAlert
                                    size={12}
                                    className="inline mr-1"
                                />
                                {t('contains', {
                                    allergens: matches.join(', '),
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    )
}
