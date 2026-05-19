import Link from 'next/link'
import { Refrigerator } from 'lucide-react'
import type { Fridge } from '../../lib/types'
import { GRADE_COLORS } from '../../lib/constants'

interface FridgeCardProps {
    fridge: Fridge
    score: string | null
}

export function FridgeCard({ fridge, score }: FridgeCardProps) {
    const displayScore = score || fridge.modalNutriScore

    return (
        <Link
            href={`/fridges/${fridge.id}`}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all duration-200 active:scale-[0.98] min-h-[80px]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {fridge.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Inventar ansehen &rarr;
                        </p>
                        {displayScore && (
                            <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-white font-bold text-[10px] uppercase shadow-sm ${GRADE_COLORS[displayScore.toLowerCase()] ?? 'bg-slate-400'}`}
                                title={`Häufigster Nutri-Score: ${displayScore.toUpperCase()}`}
                            >
                                {displayScore.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-all duration-200 shadow-inner flex-shrink-0">
                    <Refrigerator size={22} strokeWidth={1.5} className="sm:w-6 sm:h-6" />
                </div>
            </div>
        </Link>
    )
}
