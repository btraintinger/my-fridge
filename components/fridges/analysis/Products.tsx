import { useTranslations } from 'next-intl'
import { SectionCard } from '@/components/layout/SectionCard'
import type { NutrimentWarning } from '@/lib/products/nutrimentWarnings'
import type { FridgeItem } from '@/lib/types'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { NutriScoreBadge } from '@/components/products/NutriScore'
import type { FridgeAnalytics } from '@/lib/fridges/fridgeAnalytics'

export interface ProductEntry {
    item: FridgeItem
    grade: string
    warnings: NutrimentWarning[]
    qualityScore: number
    warningLevel: number
}

export function BestProducts({ entries }: { entries: ProductEntry[] }) {
    const t = useTranslations('fridges.analysis')
    return (
        <SectionCard title={t('best.title')} subtitle={t('best.subtitle')}>
            {entries.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('best.empty')}
                </p>
            ) : (
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <ProductInsightRow
                            key={entry.item.id}
                            name={entry.item.product.product_name}
                            brand={entry.item.product.brands}
                            grade={entry.item.product.nutriscore_grade}
                            warnings={entry.warnings.length}
                            warningLabel={t('warningCount', {
                                count: entry.warnings.length,
                            })}
                            trend="up"
                        />
                    ))}
                </div>
            )}
        </SectionCard>
    )
}

export function NeedsAttention({ entries }: { entries: ProductEntry[] }) {
    const t = useTranslations('fridges.analysis')
    return (
        <SectionCard
            title={t('needsAttention.title')}
            subtitle={t('needsAttention.subtitle')}
        >
            {entries.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('needsAttention.empty')}
                </p>
            ) : (
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <ProductInsightRow
                            key={entry.item.id}
                            name={entry.item.product.product_name}
                            brand={entry.item.product.brands}
                            grade={entry.item.product.nutriscore_grade}
                            warnings={entry.warnings.length}
                            warningLabel={t('warningCount', {
                                count: entry.warnings.length,
                            })}
                            trend="down"
                        />
                    ))}
                </div>
            )}
        </SectionCard>
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

export function TopBrands({
    brands,
}: {
    brands: FridgeAnalytics['topBrands']
}) {
    const t = useTranslations('fridges.analysis.topBrands')
    return (
        <SectionCard title={t('title')} subtitle={t('subtitle')}>
            {brands.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('empty')}
                </p>
            ) : (
                <div className="space-y-2">
                    {brands.map((brand) => (
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
    )
}
