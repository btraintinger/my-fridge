'use client'

import { useCallback, useEffect, useRef, useState, memo } from 'react'
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
    type CameraDevice,
} from 'html5-qrcode'
import { useTranslations } from 'next-intl'
import { Camera, X, Loader2 } from 'lucide-react'
import { Button } from './ui/Button'

interface ScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onScan: (barcode: string) => void
    isMultiScan?: boolean
    onComplete?: () => void
    scannedCount?: number
}

const SCANNER_CONTAINER_ID = 'scanner-modal-container'

const ScannerContainer = memo(() => (
    <div
        id={SCANNER_CONTAINER_ID}
        className="w-full rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black relative"
        style={{
            aspectRatio: '1.5',
            maxHeight: '360px',
        }}
    />
))
ScannerContainer.displayName = 'ScannerContainer'

function normalizeDigits(value: string): string {
    return value.replace(/\s+/g, '')
}

function clearScannerContainer() {
    const container = document.getElementById(SCANNER_CONTAINER_ID)
    if (container) container.innerHTML = ''
}

type ExtendedCapabilities = MediaTrackCapabilities & {
    torch?: boolean
    zoom?: { max: number; min?: number; step?: number }
    focusDistance?: { max: number; min: number; step?: number }
    frameRate?: { max: number }
}
type CameraConfig = string | { facingMode: string } | { deviceId: string }

function pickBackCameraIndex(cameras: CameraDevice[]): number {
    // Prefer the standard back camera; avoid ultra-wide / telephoto which
    // cannot autofocus close enough for barcode scanning on iPhones.
    const preferred = cameras.findIndex(
        (d) =>
            /back|rück|rear/i.test(d.label) &&
            !/ultra|tele|telephoto|wide angle/i.test(d.label)
    )
    if (preferred !== -1) return preferred
    const anyBack = cameras.findIndex((d) => /back|rück|rear/i.test(d.label))
    return anyBack !== -1 ? anyBack : 0
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
    const [scannerReady, setScannerReady] = useState(false)
    const [error, setError] = useState('')
    const [torchSupported, setTorchSupported] = useState(false)
    const [torchEnabled, setTorchEnabled] = useState(false)
    const [torchBusy, setTorchBusy] = useState(false)
    const [optimizationState, setOptimizationState] = useState('')

    const scannerRef = useRef<Html5Qrcode | null>(null)
    const transitionRef = useRef<Promise<void> | null>(null)
    const isInitializedRef = useRef(false)
    const camerasRef = useRef<CameraDevice[]>([])
    const currentIdxRef = useRef(0)
    const hasScannedRef = useRef(false)
    const lastScannedCodeRef = useRef<string | null>(null)
    const lastScannedTimeRef = useRef<number>(0)

    const onScanRef = useRef(onScan)
    const onCloseRef = useRef(onClose)
    useEffect(() => {
        onScanRef.current = onScan
        onCloseRef.current = onClose
    }, [onScan, onClose])

    // Serialize start/stop/torch operations so html5-qrcode never sees
    // overlapping state transitions on the same instance.
    const queueTransition = useCallback((fn: () => Promise<void>) => {
        const previous = transitionRef.current
        const next = (async () => {
            if (previous) await previous
            await fn()
        })()
        transitionRef.current = next
        return next
    }, [])

    const stopScanner = useCallback(
        () =>
            queueTransition(async () => {
                try {
                    const scanner = scannerRef.current
                    if (scanner) {
                        if (scanner.isScanning) {
                            await scanner.stop()
                        }
                        clearScannerContainer()
                        scannerRef.current = null
                    }
                } catch (e) {
                    console.debug('Safe stop error:', e)
                    clearScannerContainer()
                } finally {
                    isInitializedRef.current = false
                    setScannerReady(false)
                    setTorchEnabled(false)
                    setTorchSupported(false)
                }
            }),
        [queueTransition]
    )

    const handleDecodedText = useCallback(
        (text: string) => {
            if (!isMultiScan) {
                if (hasScannedRef.current) return
                hasScannedRef.current = true
            }

            const normalized = normalizeDigits(text)

            if (isMultiScan) {
                const now = Date.now()
                if (
                    lastScannedCodeRef.current === normalized &&
                    now - lastScannedTimeRef.current < 2000
                ) {
                    return
                }
                lastScannedCodeRef.current = normalized
                lastScannedTimeRef.current = now
                onScanRef.current(normalized)
            } else {
                stopScanner().then(() => {
                    onCloseRef.current()
                    // Delay onScan so this modal fully unmounts before the
                    // parent opens the follow-up product modal.
                    setTimeout(() => onScanRef.current(normalized), 100)
                })
            }
        },
        [isMultiScan, stopScanner]
    )

    const startScanner = useCallback(
        (idxOverride?: number) => {
            if (isInitializedRef.current && idxOverride === undefined)
                return Promise.resolve()
            isInitializedRef.current = true

            return queueTransition(async () => {
                try {
                    if (!isOpen) {
                        isInitializedRef.current = false
                        return
                    }

                    setError('')
                    setScannerReady(false)
                    hasScannedRef.current = false

                    const container =
                        document.getElementById(SCANNER_CONTAINER_ID)
                    if (!container) throw new Error(t('scannerAreaNotFound'))
                    container.innerHTML = ''

                    const scanner = new Html5Qrcode(SCANNER_CONTAINER_ID, {
                        verbose: false,
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.EAN_13,
                            Html5QrcodeSupportedFormats.EAN_8,
                            Html5QrcodeSupportedFormats.UPC_A,
                            Html5QrcodeSupportedFormats.UPC_E,
                        ],
                    })
                    scannerRef.current = scanner

                    // First open uses facingMode and skips enumerateDevices —
                    // calling getCameras() before start() can break the
                    // user-gesture context for getUserMedia on iOS Safari.
                    // switchCamera populates camerasRef before reaching here
                    // with idxOverride set.
                    let cameraConfig: CameraConfig = {
                        facingMode: 'environment',
                    }
                    if (
                        idxOverride !== undefined &&
                        camerasRef.current.length > 0
                    ) {
                        const cam =
                            camerasRef.current[
                                idxOverride % camerasRef.current.length
                            ]
                        if (cam?.id) cameraConfig = { deviceId: cam.id }
                    }

                    await scanner.start(
                        cameraConfig,
                        {
                            fps: 10,
                            qrbox: (w, h) => ({
                                width: Math.max(Math.min(w * 0.8, 280), 150),
                                height: Math.max(Math.min(h * 0.4, 180), 80),
                            }),
                            // aspectRatio omitted: iOS Safari throws
                            // OverconstrainedError when it's set.
                        },
                        handleDecodedText,
                        () => {}
                    )

                    // iOS 26 workaround: html5-qrcode/ZXing silently fails to
                    // decode frames until we re-apply video constraints after
                    // the stream is live. Applying frameRate + zoom +
                    // focusDistance nudges WebKit's video pipeline so the
                    // decoder actually starts consuming frames.
                    try {
                        const caps =
                            scanner.getRunningTrackCapabilities() as ExtendedCapabilities
                        setTorchSupported(!!caps.torch)
                        const advanced: MediaTrackConstraintSet[] = []
                        if (caps.zoom) {
                            advanced.push({
                                zoom: Math.min(2.0, caps.zoom.max),
                            } as MediaTrackConstraintSet)
                        }
                        if (caps.focusDistance) {
                            advanced.push({
                                focusDistance: caps.focusDistance.min,
                            } as MediaTrackConstraintSet)
                        }
                        await scanner.applyVideoConstraints({
                            width: { ideal: 1000 },
                            frameRate: { ideal: caps.frameRate?.max ?? 30 },
                            advanced,
                        })
                    } catch (e) {
                        console.debug('Constraint reset failed:', e)
                    }

                    setScannerReady(true)
                } catch (err) {
                    console.error('Start failed:', err)
                    setError(t('starting'))
                    isInitializedRef.current = false
                }
            })
        },
        [isOpen, queueTransition, t, handleDecodedText]
    )

    const switchCamera = useCallback(async () => {
        // Lazy-enumerate: cameras aren't requested on the initial start
        // (iOS reliability fix), so resolve the list on the first switch.
        if (camerasRef.current.length === 0) {
            try {
                camerasRef.current = await Html5Qrcode.getCameras()
            } catch (e) {
                console.warn('Cannot list cameras for switch:', e)
                return
            }
            // First switch: jump to the best back camera (skip Ultra
            // Wide / Telephoto which can't autofocus close enough).
            currentIdxRef.current = pickBackCameraIndex(camerasRef.current)
        } else {
            currentIdxRef.current =
                (currentIdxRef.current + 1) % camerasRef.current.length
        }
        if (camerasRef.current.length <= 1) return
        setOptimizationState(t('optimizingLens'))
        isInitializedRef.current = false
        await stopScanner()
        await startScanner(currentIdxRef.current)
    }, [stopScanner, startScanner, t])

    const toggleTorch = useCallback(() => {
        if (!scannerRef.current || torchBusy) return
        return queueTransition(async () => {
            try {
                setTorchBusy(true)
                const scanner = scannerRef.current
                if (!scanner?.isScanning) return
                const newState = !torchEnabled
                await scanner.applyVideoConstraints({
                    advanced: [{ torch: newState } as MediaTrackConstraintSet],
                })
                setTorchEnabled(newState)
            } catch (e) {
                console.error('Torch error:', e)
            } finally {
                setTorchBusy(false)
            }
        })
    }, [torchEnabled, torchBusy, queueTransition])

    useEffect(() => {
        if (isOpen) {
            startScanner()
        } else {
            stopScanner()
        }
        return () => {
            stopScanner()
        }
    }, [isOpen, startScanner, stopScanner])

    useEffect(() => {
        if (isOpen && scannerReady && !hasScannedRef.current) {
            const timer = setInterval(() => {
                if (hasScannedRef.current || !isOpen) return
                setOptimizationState(t('focusing'))
                setTimeout(() => setOptimizationState(''), 1500)
            }, 5000)
            return () => clearInterval(timer)
        }
    }, [isOpen, scannerReady, t])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 flex items-center justify-between border-b dark:border-slate-800">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <Camera size={20} className="text-emerald-500" />
                        {t('title')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
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
                            <Loader2
                                className="animate-spin text-emerald-500"
                                size={32}
                            />
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

                    <div className="flex gap-2">
                        {torchSupported && (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={toggleTorch}
                                disabled={torchBusy}
                            >
                                {torchEnabled ? t('flashOff') : t('flashOn')}
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={switchCamera}
                        >
                            {t('switchLens')}
                        </Button>
                    </div>

                    {isMultiScan && onComplete ? (
                        <Button className="w-full" onClick={onComplete}>
                            {t('complete')}{' '}
                            {scannedCount ? `(${scannedCount})` : ''}
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            className="w-full text-slate-400 text-xs"
                            onClick={onClose}
                        >
                            {t('cancel')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
