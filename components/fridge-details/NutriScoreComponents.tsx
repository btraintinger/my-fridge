import { NUTRI_GRADES } from '@/lib/constants'
import type { FridgeItem } from '@/lib/types'

export function NutriScoreBadge({
    grade,
    size = 'md',
}: {
    grade?: string | null
    size?: 'sm' | 'md'
}) {
    if (!grade) return null
    const g = NUTRI_GRADES.find((x) => x.grade === grade.toLowerCase())
    const sizeClasses =
        size === 'sm'
            ? 'w-6 h-6 rounded-lg text-[10px]'
            : 'w-10 h-10 rounded-xl text-base'

    return (
        <div
            className={`${sizeClasses} flex items-center justify-center text-white font-bold uppercase shadow-sm ${g?.bg ?? 'bg-slate-400'}`}
            title={`Nutri-Score: ${grade.toUpperCase()}`}
        >
            {grade.toUpperCase()}
        </div>
    )
}

export function NutriScoreDistribution({ items }: { items: FridgeItem[] }) {
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
                Nutri-Score Verteilung
            </p>
            <div className="flex gap-1 h-8 rounded-xl overflow-hidden">
                {counts.map((g) =>
                    g.count > 0 ? (
                        <div
                            key={g.grade}
                            className={`${g.bg} flex items-center justify-center text-white font-bold text-xs transition-all`}
                            style={{ flex: g.count }}
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
