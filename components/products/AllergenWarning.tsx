import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AllergenWarning({
    allergenLabels,
    description,
}: {
    allergenLabels: string
    description?: string
}) {
    const t = useTranslations('allergenWarning')
    if (!allergenLabels) return null
    return (
        <Alert
            variant="destructive"
            className="rounded-2xl border border-rose-300/80 bg-rose-50 p-4 dark:border-rose-800/60 dark:bg-rose-950/30"
        >
            <AlertTitle className="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-1">
                <AlertCircle size={16} />
                {t('title')}
            </AlertTitle>
            <AlertDescription className="text-sm text-rose-700 dark:text-rose-200">
                {description ?? t('body', { allergens: allergenLabels })}
            </AlertDescription>
        </Alert>
    )
}
