'use client'

import { useTranslations } from 'next-intl'
import { Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/feedback/Spinner'
import { CameraControls } from '@/components/scanner/CameraControls'
import { useBarcodeScanner } from '@/components/scanner/useBarcodeScanner'
import { memo } from 'react'
import { SCANNER_CONTAINER_ID } from '@/components/scanner/camera'

interface ScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onScan: (barcode: string) => void
    isMultiScan?: boolean
    onComplete?: () => void
    scannedCount?: number
}

export function ScannerModal({
    isOpen,
    onClose,
    onScan,
    isMultiScan,
    onComplete,
    scannedCount,
}: ScannerModalProps) {
    const t = useTranslations('scanner.modal')
    const {
        scannerReady,
        error,
        torchSupported,
        torchEnabled,
        torchBusy,
        optimizationState,
        startScanner,
        switchCamera,
        toggleTorch,
    } = useBarcodeScanner({
        isOpen,
        onClose,
        onScan,
        isMultiScan,
    })

    if (!isOpen) return null

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent
                aria-describedby={undefined}
                overlayClassName="bg-black/80 backdrop-blur-md"
                onOpenAutoFocus={() => {
                    void startScanner()
                }}
                className="flex max-h-[90dvh] flex-col gap-0 overflow-y-auto rounded-3xl bg-card p-0 sm:max-w-md"
            >
                <div className="p-4 pr-14 flex items-center justify-between border-b dark:border-slate-800">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <Camera size={20} className="text-emerald-500" />
                        {t('title')}
                    </DialogTitle>
                </div>

                <div className="p-6 space-y-4">
                    <ScannerContainer />

                    {error && (
                        <p className="text-red-500 text-sm text-center font-medium">
                            {error}
                        </p>
                    )}

                    {!scannerReady && !error && (
                        <div className="flex flex-col items-center gap-2 py-4">
                            <Spinner label={t('initializing')} />
                            <p className="text-slate-500 text-xs">
                                {t('initializing')}
                            </p>
                        </div>
                    )}

                    {optimizationState && (
                        <div className="text-center">
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
                                {optimizationState}
                            </span>
                        </div>
                    )}

                    <CameraControls
                        torchSupported={torchSupported}
                        torchEnabled={torchEnabled}
                        torchBusy={torchBusy}
                        onToggleTorch={toggleTorch}
                        onSwitchCamera={switchCamera}
                        isMultiScan={isMultiScan}
                        scannedCount={scannedCount}
                        onComplete={onComplete}
                        onCancel={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

const ScannerContainer = memo(() => (
    <div
        id={SCANNER_CONTAINER_ID}
        className="w-full rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black relative"
        style={{ aspectRatio: '1.5', maxHeight: '360px' }}
    />
))
ScannerContainer.displayName = 'ScannerContainer'
