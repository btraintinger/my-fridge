import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NutriScoreBadge } from '@/components/products/NutriScore'
import type { Product } from '@/lib/types'
import { NutritionFacts } from '@/components/products/NutritionFacts'

export function NutritionTable({
    product,
}: {
    product: Pick<Product, 'nutriscore_grade' | 'ecoscore_grade' | 'nutriments'>
}) {
    const t = useTranslations('productModal')
    const hasScores = product.nutriscore_grade || product.ecoscore_grade

    const ecoColor =
        product.ecoscore_grade === 'a'
            ? 'bg-emerald-600'
            : product.ecoscore_grade === 'b'
              ? 'bg-emerald-500'
              : product.ecoscore_grade === 'c'
                ? 'bg-yellow-500'
                : product.ecoscore_grade === 'd'
                  ? 'bg-orange-500'
                  : 'bg-red-500'

    return (
        <div className="space-y-4">
            {hasScores && (
                <div className="flex gap-4">
                    {product.nutriscore_grade && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                {t('nutriScore')}
                            </span>
                            <NutriScoreBadge grade={product.nutriscore_grade} />
                        </div>
                    )}
                    {product.ecoscore_grade && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                {t('ecoScore')}
                            </span>
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base uppercase shadow-sm ${ecoColor}`}
                            >
                                {product.ecoscore_grade}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {product.nutriments && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <Info size={16} className="text-emerald-500" />
                        {t('nutritionTitle')}
                    </h3>
                    <NutritionFacts nutriments={product.nutriments} />
                </div>
            )}
        </div>
    )
}
