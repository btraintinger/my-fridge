import { useTranslations } from 'next-intl'
import {
    NUTRIENT_FIELDS,
    formatNutrientValue,
} from '@/lib/products/nutritionFacts'
import type { Nutriments } from '@/lib/types'

export function NutritionFacts({
    nutriments,
    layout = 'grid',
}: {
    nutriments: Nutriments
    layout?: 'grid' | 'list'
}) {
    const t = useTranslations('productModal')
    const isGrid = layout === 'grid'
    return (
        <div
            className={
                isGrid ? 'grid grid-cols-2 gap-2 text-sm' : 'space-y-2 text-sm'
            }
        >
            {NUTRIENT_FIELDS.map(({ key, label, unit }) => (
                <div
                    key={key}
                    className={
                        isGrid
                            ? 'bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between'
                            : 'flex justify-between text-slate-600 dark:text-slate-400'
                    }
                >
                    <span className="text-slate-500 dark:text-slate-400">
                        {t(label)}
                    </span>
                    <span
                        className={`${isGrid ? 'font-bold' : 'font-medium'} text-slate-900 dark:text-slate-50`}
                    >
                        {formatNutrientValue(nutriments[key], unit)}
                    </span>
                </div>
            ))}
        </div>
    )
}
