import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'
import type { NutrimentWarning } from '@/lib/products/nutrimentWarnings'

export function NutrientWarnings({
    warnings,
    title,
}: {
    warnings: NutrimentWarning[]
    title?: string
}) {
    const t = useTranslations()
    if (warnings.length === 0) return null
    return (
        <Alert className="space-y-2 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
            <AlertTitle className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {title ?? t('productModal.nutritionWarnings')}
            </AlertTitle>
            <AlertDescription className="space-y-2">
                {warnings.map((warning) => (
                    <p
                        key={warning.id}
                        className="text-sm text-amber-900 dark:text-amber-200"
                    >
                        <span className="font-semibold">
                            {t(
                                `nutrimentWarnings.${warning.id}.label` as never
                            )}
                            :
                        </span>{' '}
                        {warning.value.toFixed(1)} {warning.unit} -{' '}
                        {t(
                            `nutrimentWarnings.${warning.id}.${warning.severity}` as never
                        )}
                    </p>
                ))}
            </AlertDescription>
        </Alert>
    )
}
