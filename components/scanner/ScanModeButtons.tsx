import { useTranslations } from 'next-intl'
import { Camera, Edit3, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ScanModeButtons({
    onSingleScan,
    onMultiScan,
    onManual,
}: {
    onSingleScan: () => void
    onMultiScan: () => void
    onManual: () => void
}) {
    const t = useTranslations('scanner')
    return (
        <div className="grid grid-cols-3 gap-3">
            <Button
                variant="outline"
                className="w-full flex-col h-auto py-4"
                onClick={onSingleScan}
            >
                <Camera
                    size={24}
                    className="mb-2 text-emerald-600 dark:text-emerald-400"
                />
                <span className="text-xs font-semibold">
                    {t('cameraScanner')}
                </span>
            </Button>
            <Button
                variant="outline"
                className="w-full flex-col h-auto py-4 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900"
                onClick={onMultiScan}
            >
                <Layers
                    size={24}
                    className="mb-2 text-emerald-600 dark:text-emerald-400"
                />
                <span className="text-xs font-semibold">{t('multiScan')}</span>
            </Button>
            <Button
                variant="outline"
                className="w-full flex-col h-auto py-4"
                onClick={onManual}
            >
                <Edit3
                    size={24}
                    className="mb-2 text-sky-600 dark:text-sky-400"
                />
                <span className="text-xs font-semibold">
                    {t('addManually')}
                </span>
            </Button>
        </div>
    )
}
