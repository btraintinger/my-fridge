import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Refrigerator } from 'lucide-react'
import type { Fridge } from '@/lib/types'
import { GRADE_COLORS } from '@/lib/constants'
import { modalFromCounts } from '@/lib/utils'

interface FridgeCardProps {
    fridge: Fridge
}

export function FridgeCard({ fridge }: FridgeCardProps) {
    const t = useTranslations('fridges.card')
    const displayScore = fridge.gradeCounts
        ? modalFromCounts(fridge.gradeCounts)
        : fridge.modalNutriScore

    return (
        <Link
            href={`/fridges/${fridge.id}`}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all duration-200 active:scale-[0.98] min-h-[80px] lg:min-h-[140px]"
        >
            <div className="flex items-start justify-between gap-3 lg:gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1 lg:mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {fridge.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 font-medium">
                            {t('viewInventory')} &rarr;
                        </p>
                        {displayScore && (
                            <span
                                className={`inline-flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-lg text-white font-bold text-[10px] lg:text-xs uppercase shadow-sm ${GRADE_COLORS[displayScore.toLowerCase()] ?? 'bg-slate-400'}`}
                                title={t('mostCommonNutriScore', {
                                    grade: displayScore.toUpperCase(),
                                })}
                            >
                                {displayScore.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-all duration-200 shadow-inner flex-shrink-0">
                    <Refrigerator
                        size={22}
                        strokeWidth={1.5}
                        className="sm:w-6 sm:h-6 lg:w-8 lg:h-8"
                    />
                </div>
            </div>
        </Link>
    )
}
