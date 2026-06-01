import { useTranslations } from 'next-intl'
import { NUTRI_GRADES } from '@/lib/constants'
import type { FridgeItem } from '@/lib/types'

export function NutriScoreBadge({
    grade,
    size = 'md',
}: {
    grade?: string | null
    size?: 'sm' | 'md'
}) {
    const normalizedGrade = grade?.toLowerCase()

    // Default or unknown state
    if (
        !normalizedGrade ||
        normalizedGrade === 'unknown' ||
        normalizedGrade === '-'
    ) {
        const sizeClasses =
            size === 'sm'
                ? 'w-6 h-6 rounded-lg text-[10px]'
                : 'w-10 h-10 rounded-xl text-base'
        return (
            <div
                className={`${sizeClasses} flex items-center justify-center text-white font-bold uppercase shadow-sm bg-slate-400 dark:bg-slate-500`}
                title="Nutri-Score: -"
            >
                -
            </div>
        )
    }

    const g = NUTRI_GRADES.find((x) => x.grade === normalizedGrade)
    const sizeClasses =
        size === 'sm'
            ? 'px-2 py-0.5 rounded-lg text-[11px]'
            : 'px-3 py-1 rounded-xl text-lg'

    // If we use precise colors, ensure good contrast.
    // The official colors look best with white text, but we add a tiny text-shadow for WCAG contrast on lighter colors (like C)
    const bgClass = g?.bg ?? 'bg-slate-400'

    return (
        <div
            className={`${sizeClasses} flex items-center justify-center text-white font-black uppercase shadow-sm ${bgClass}`}
            title={`Nutri-Score: ${normalizedGrade.toUpperCase()}`}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
        >
            {normalizedGrade.toUpperCase()}
        </div>
    )
}

export function NutriScoreDistribution({ items }: { items: FridgeItem[] }) {
    const t = useTranslations('fridges.analysis.nutriSpread')
    const withScore = items.filter((i) => i.product?.nutriscore_grade)
    if (withScore.length === 0) return null

    const counts = NUTRI_GRADES.map((g) => ({
        ...g,
        count: withScore.filter(
            (i) => i.product?.nutriscore_grade?.toLowerCase() === g.grade
        ).length,
    }))

    return (
        <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {t('title')}
            </p>
            <div className="flex gap-1 h-8 rounded-xl overflow-hidden">
                {counts.map((g) =>
                    g.count > 0 ? (
                        <div
                            key={g.grade}
                            className={`${g.bg} flex items-center justify-center text-white font-bold text-xs transition-all`}
                            style={{
                                flex: g.count,
                                textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                            }}
                            title={`${g.label}: ${g.count}`}
                        >
                            {g.label}
                        </div>
                    ) : null
                )}
            </div>
            <div className="flex gap-1 mt-1">
                {counts.map((g) =>
                    g.count > 0 ? (
                        <div
                            key={g.grade}
                            className="text-xs text-slate-400 text-center"
                            style={{ flex: g.count }}
                        >
                            {g.count}
                        </div>
                    ) : null
                )}
            </div>
        </div>
    )
}
