import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function CameraControls({
    torchSupported,
    torchEnabled,
    torchBusy,
    onToggleTorch,
    onSwitchCamera,
    isMultiScan,
    scannedCount,
    onComplete,
    onCancel,
}: {
    torchSupported: boolean
    torchEnabled: boolean
    torchBusy: boolean
    onToggleTorch: () => void
    onSwitchCamera: () => void
    isMultiScan?: boolean
    scannedCount?: number
    onComplete?: () => void
    onCancel: () => void
}) {
    const t = useTranslations('scanner.modal')
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                {torchSupported && (
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onToggleTorch}
                        disabled={torchBusy}
                    >
                        {torchEnabled ? t('flashOff') : t('flashOn')}
                    </Button>
                )}
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onSwitchCamera}
                >
                    {t('switchLens')}
                </Button>
            </div>

            {isMultiScan && onComplete ? (
                <Button className="w-full" onClick={onComplete}>
                    {t('complete')} {scannedCount ? `(${scannedCount})` : ''}
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    className="w-full text-slate-400 text-xs"
                    onClick={onCancel}
                >
                    {t('cancel')}
                </Button>
            )}
        </div>
    )
}
