import type { ReactNode } from 'react'
import { Progress } from '@/components/ui/progress'

const TONE_CLASSES: Record<string, string> = {
    emerald:
        'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20',
    rose: 'border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20',
    amber: 'border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20',
}

export function MiniStat({
    label,
    value,
    tone = 'emerald',
}: {
    label: string
    value: number
    tone?: 'emerald' | 'rose' | 'amber'
}) {
    return (
        <div
            className={`rounded-2xl border p-3 text-center ${TONE_CLASSES[tone]}`}
        >
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
                {value}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                {label}
            </div>
        </div>
    )
}

export function StatCard({
    icon,
    label,
    value,
}: {
    icon: ReactNode
    label: string
    value: string
}) {
    return (
        <div className="rounded-[1.2rem] sm:rounded-[1.5rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {label}
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
                    {value}
                </p>
            </div>
        </div>
    )
}

export function CoverageRow({
    label,
    value,
    total,
}: {
    label: string
    value: number
    total: number
}) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {label}
                </span>
                <span className="text-xs font-bold text-slate-400">
                    {value}/{total}
                </span>
            </div>
            <Progress
                value={percentage}
                aria-label={label}
                aria-valuetext={`${value}/${total}`}
                className="h-2 bg-slate-100 dark:bg-slate-800 [&_[data-slot=progress-indicator]]:bg-emerald-500"
            />
        </div>
    )
}
