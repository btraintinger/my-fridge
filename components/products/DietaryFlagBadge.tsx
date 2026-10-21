import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

export function DietaryFlagBadge({
    label,
    value,
}: {
    label: string
    value: boolean | null | undefined
}) {
    const t = useTranslations('common')
    const text =
        value === true ? t('yes') : value === false ? t('no') : t('none')
    const style =
        value === true
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50'
            : value === false
              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50'
              : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700'

    return (
        <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}
        >
            {label}: {text}
        </Badge>
    )
}
