'use client'

import { useCallback, useEffect, useRef, useState, memo } from 'react'
import {
    Html5Qrcode,
    Html5QrcodeResult,
    Html5QrcodeSupportedFormats,
} from 'html5-qrcode'
import { useTranslations } from 'next-intl'
import { Camera, X, Loader2 } from 'lucide-react'
import { Button } from './ui/Button'

interface ScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onScan: (barcode: string) => void
}

const ScannerContainer = memo(() => (
    <div
        id="scanner-modal-container"
        className="w-full rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black flex items-center justify-center relative"
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

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
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
    const camerasRef = useRef<any[]>([])
    const currentIdxRef = useRef(0)
    const hasScannedRef = useRef(false)

    const onScanRef = useRef(onScan)
    const onCloseRef = useRef(onClose)
    useEffect(() => { onScanRef.current = onScan }, [onScan])
    useEffect(() => { onCloseRef.current = onClose }, [onClose])

    const stopScanner = useCallback(async () => {
        const currentTransition = transitionRef.current
        transitionRef.current = (async () => {
            try {
                if (currentTransition) await currentTransition
                if (scannerRef.current) {
                    const scanner = scannerRef.current
                    if (scanner.isScanning) {
                        await scanner.stop()
                    }
                    const container = document.getElementById('scanner-modal-container')
                    if (container) {
                        container.innerHTML = ''
                    }
                    scannerRef.current = null
                }
            } catch (e) {
                console.debug('Safe stop error:', e)
                const container = document.getElementById('scanner-modal-container')
                if (container) container.innerHTML = ''
            } finally {
                isInitializedRef.current = false
                setScannerReady(false)
                setTorchEnabled(false)
                setTorchSupported(false)
            }
        })()
        return transitionRef.current
    }, [])

    const startScanner = useCallback(async (idxOverride?: number) => {
        if (isInitializedRef.current && idxOverride === undefined) return
        isInitializedRef.current = true

        const currentTransition = transitionRef.current
        transitionRef.current = (async () => {
            try {
                if (currentTransition) await currentTransition
                if (!isOpen) {
                    isInitializedRef.current = false
                    return
                }

                setError('')
                setScannerReady(false)
                hasScannedRef.current = false

                const container = document.getElementById('scanner-modal-container')
                if (!container) throw new Error(t('scannerAreaNotFound'))
                container.innerHTML = ''

                const scanner = new Html5Qrcode('scanner-modal-container', {
                    verbose: false,
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                    ],
                })
                scannerRef.current = scanner

                let cameraConfig: any = { facingMode: "environment" }

                // Versuche spezifische Kamera-ID zu finden (oft auf Android/Desktop nützlich)
                try {
                    if (camerasRef.current.length === 0) {
                        camerasRef.current = await Html5Qrcode.getCameras()
                    }

                    if (camerasRef.current.length > 0) {
                        // Back-Kamera Logik
                        if (idxOverride === undefined && currentIdxRef.current === 0) {
                            const backIdx = camerasRef.current.findLastIndex(d =>
                                /back|rück|rear/i.test(d.label)
                            )
                            if (backIdx !== -1) currentIdxRef.current = backIdx
                        }

                        const selectedIdx = idxOverride !== undefined ? idxOverride : currentIdxRef.current
                        const cam = camerasRef.current[selectedIdx]
                        
                        // Wenn Labels auf iOS leer sind (vor Permission), verlasse dich auf facingMode
                        if (cam && cam.id && cam.label !== "") {
                            cameraConfig = cam.id
                        }
                    }
                } catch (e) {
                    console.warn("Fehler beim Abrufen der Kameras, falle zurück auf facingMode", e)
                }


                await scanner.start(
                    cameraConfig,
                    {
                        fps: 30,
                        qrbox: (w, h) => ({
                            width: Math.max(Math.min(w * 0.8, 280), 150),
                            height: Math.max(Math.min(h * 0.4, 180), 80)
                        }),
                        // aspectRatio entfernt, da es auf iOS zu OverconstrainedError führt
                    },
                    (text) => {
                        if (hasScannedRef.current) return
                        hasScannedRef.current = true

                        stopScanner().then(() => {
                            onCloseRef.current()
                            setTimeout(() => onScanRef.current(normalizeDigits(text)), 100)
                        })
                    },
                    () => { }
                )

                // Makro-Zoom & Torch für unterstützte Geräte
                try {
                    const track = (scanner as any)._videoTrack
                    if (track && typeof track.getCapabilities === 'function') {
                        const caps = track.getCapabilities()
                        setTorchSupported(!!caps.torch)
                        if (caps.zoom) {
                            await track.applyConstraints({ advanced: [{ zoom: Math.min(2.0, caps.zoom.max) }] })
                        }
                    }
                } catch (e) { 
                    console.debug('Zoom/Torch not supported:', e)
                }

                setScannerReady(true)
            } catch (err: any) {
                console.error('Start failed:', err)
                setError(t('starting'))
                isInitializedRef.current = false
                
                // Endlos-Retry bei Hardware-Fehlern (wie OverconstrainedError) vermeiden
                if (idxOverride === undefined && camerasRef.current.length > 1) {
                    setTimeout(() => {
                        if (isOpen && !hasScannedRef.current) switchCamera()
                    }, 3000)
                }
            }
        })()
    }, [isOpen, stopScanner, t])

    const switchCamera = useCallback(() => {
        if (camerasRef.current.length <= 1) return
        currentIdxRef.current = (currentIdxRef.current + 1) % camerasRef.current.length
        setOptimizationState(t('optimizingLens'))
        isInitializedRef.current = false
        stopScanner().then(() => startScanner(currentIdxRef.current))
    }, [stopScanner, startScanner, t])

    const toggleTorch = useCallback(async () => {
        if (!scannerRef.current || torchBusy) return
        const currentTransition = transitionRef.current
        transitionRef.current = (async () => {
            try {
                if (currentTransition) await currentTransition
                setTorchBusy(true)
                const newState = !torchEnabled
                const track = (scannerRef.current as any)._videoTrack
                if (track) {
                    await track.applyConstraints({ advanced: [{ torch: newState }] })
                    setTorchEnabled(newState)
                }
            } catch (e) {
                console.error('Torch error:', e)
            } finally {
                setTorchBusy(false)
            }
        })()
    }, [torchEnabled, torchBusy])

    useEffect(() => {
        if (isOpen) {
            startScanner()
        } else {
            stopScanner()
        }
        return () => { stopScanner() }
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
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <ScannerContainer />

                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                    {!scannerReady && !error && (
                        <div className="flex flex-col items-center gap-2 py-4">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                            <p className="text-slate-500 text-xs">{t('initializing')}</p>
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
                            <Button variant="outline" className="flex-1" onClick={toggleTorch} disabled={torchBusy}>
                                {torchEnabled ? t('flashOff') : t('flashOn')}
                            </Button>
                        )}
                        <Button variant="secondary" className="flex-1" onClick={switchCamera}>
                            {t('switchLens')}
                        </Button>
                    </div>

                    <Button variant="ghost" className="w-full text-slate-400 text-xs" onClick={onClose}>
                        {t('cancel')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
