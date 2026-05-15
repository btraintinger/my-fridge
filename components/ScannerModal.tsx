'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Html5Qrcode,
    Html5QrcodeResult,
    Html5QrcodeSupportedFormats,
} from 'html5-qrcode'
import { Camera, X } from 'lucide-react'
import { Button } from './ui/Button'

interface ScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onScan: (barcode: string) => void
}

type TorchTrackCapabilities = MediaTrackCapabilities & {
    torch?: boolean
}

type TorchTrackSettings = MediaTrackSettings & {
    torch?: boolean
}

type TorchConstraintSet = MediaTrackConstraintSet & {
    torch?: boolean
}

function normalizeDigits(value: string): string {
    return value.replace(/\s+/g, '')
}

function isNumeric(value: string): boolean {
    return /^\d+$/.test(value)
}

function isValidEan13(code: string): boolean {
    if (code.length !== 13 || !isNumeric(code)) return false

    const check = Number(code[12])
    const sum = code
        .slice(0, 12)
        .split('')
        .reduce((acc, digit, idx) => {
            const n = Number(digit)
            return acc + (idx % 2 === 0 ? n : n * 3)
        }, 0)

    return (10 - (sum % 10)) % 10 === check
}

function isValidEan8(code: string): boolean {
    if (code.length !== 8 || !isNumeric(code)) return false

    const check = Number(code[7])
    const sum = code
        .slice(0, 7)
        .split('')
        .reduce((acc, digit, idx) => {
            const n = Number(digit)
            return acc + (idx % 2 === 0 ? n * 3 : n)
        }, 0)

    return (10 - (sum % 10)) % 10 === check
}

function isValidUpcA(code: string): boolean {
    if (code.length !== 12 || !isNumeric(code)) return false

    const check = Number(code[11])
    const sum = code
        .slice(0, 11)
        .split('')
        .reduce((acc, digit, idx) => {
            const n = Number(digit)
            return acc + (idx % 2 === 0 ? n * 3 : n)
        }, 0)

    return (10 - (sum % 10)) % 10 === check
}

function isValidScannedBarcode(
    decodedText: string,
    result: Html5QrcodeResult
): boolean {
    const value = normalizeDigits(decodedText)
    const format = result.result?.format?.format

    switch (format) {
        case Html5QrcodeSupportedFormats.EAN_13:
            return isValidEan13(value)
        case Html5QrcodeSupportedFormats.EAN_8:
            return isValidEan8(value)
        case Html5QrcodeSupportedFormats.UPC_A:
            return isValidUpcA(value)
        case Html5QrcodeSupportedFormats.UPC_E:
            return value.length === 8 && isNumeric(value)
        default:
            return false
    }
}

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
    const [error, setError] = useState('')
    const [scannerReady, setScannerReady] = useState(false)
    const [torchSupported, setTorchSupported] = useState(false)
    const [torchEnabled, setTorchEnabled] = useState(false)
    const [torchBusy, setTorchBusy] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const transitionRef = useRef<Promise<void> | null>(null)
    const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hasScannedRef = useRef(false)

    const stopScanner = useCallback(async () => {
        try {
            if (startTimeoutRef.current) {
                clearTimeout(startTimeoutRef.current)
                startTimeoutRef.current = null
            }

            if (transitionRef.current) await transitionRef.current

            const stop = async () => {
                if (scannerRef.current) {
                    try {
                        // Always call stop first to halt scanning
                        await scannerRef.current.stop()
                    } catch (e) {
                        // stop() can throw if not scanning, that's ok
                    }
                    try {
                        // Then clear the scanner
                        scannerRef.current.clear()
                    } catch (e) {
                        // clear() might also throw if already cleared
                    }
                    scannerRef.current = null
                }
            }

            transitionRef.current = stop()
            await transitionRef.current
        } catch (err) {
            console.error('Error stopping scanner:', err)
        } finally {
            hasScannedRef.current = false
            setScannerReady(false)
            setTorchEnabled(false)
            setTorchSupported(false)
            setTorchBusy(false)
            transitionRef.current = null
        }
    }, [])

    const updateTorchStateFromTrack = useCallback(() => {
        if (!scannerRef.current || !scannerRef.current.isScanning) {
            setTorchSupported(false)
            setTorchEnabled(false)
            return
        }

        try {
            const capabilities =
                scannerRef.current.getRunningTrackCapabilities() as TorchTrackCapabilities
            const settings =
                scannerRef.current.getRunningTrackSettings() as TorchTrackSettings

            const supported = Boolean(capabilities?.torch)

            setTorchSupported(supported)
            setTorchEnabled(Boolean(settings?.torch))
        } catch (err) {
            console.error('Error reading torch capabilities:', err)
            setTorchSupported(false)
            setTorchEnabled(false)
        }
    }, [])

    const toggleTorch = useCallback(async () => {
        if (!scannerRef.current || !scannerRef.current.isScanning || torchBusy)
            return

        setTorchBusy(true)
        try {
            await scannerRef.current.applyVideoConstraints(
                {
                    advanced: [
                        { torch: !torchEnabled } as TorchConstraintSet,
                    ],
                } as MediaTrackConstraints
            )
            updateTorchStateFromTrack()
        } catch (err) {
            console.error('Error toggling torch:', err)
            setError('Flashlight is not available on this device/camera.')
        } finally {
            setTorchBusy(false)
        }
    }, [torchBusy, torchEnabled, updateTorchStateFromTrack])

    const startScanner = useCallback(async () => {
        setError('')
        setScannerReady(false)
        setTorchEnabled(false)
        setTorchSupported(false)
        hasScannedRef.current = false

        if (startTimeoutRef.current) {
            clearTimeout(startTimeoutRef.current)
            startTimeoutRef.current = null
        }

        // Tiny delay to ensure the container is in the DOM
        startTimeoutRef.current = setTimeout(async () => {
            startTimeoutRef.current = null
            if (!isOpen) return // Don't start if it's already closed

            try {
                if (transitionRef.current) await transitionRef.current
                if (hasScannedRef.current) return // If scan already completed, don't restart

                const start = async () => {
                    // Ensure old scanner is fully cleaned up
                    if (scannerRef.current) {
                        try {
                            await scannerRef.current.stop()
                        } catch (e) {
                            // ok if not scanning
                        }
                        try {
                            scannerRef.current.clear()
                        } catch (e) {
                            // ok if already cleared
                        }
                    }

                    const scanner = new Html5Qrcode('scanner-modal-container', {
                        useBarCodeDetectorIfSupported: true,
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.EAN_13,
                            Html5QrcodeSupportedFormats.EAN_8,
                            Html5QrcodeSupportedFormats.UPC_A,
                            Html5QrcodeSupportedFormats.UPC_E,
                        ],
                        verbose: false,
                    })
                    scannerRef.current = scanner

                    const hasNativeBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window

                    await scanner.start(
                        { facingMode: 'environment' },
                        {
                            // 3. FPS auf 30 erhöhen
                            fps: 30,
                            disableFlip: false,
                            qrbox: (viewfinderWidth) => {
                                // 4. Scan-Bereich (qrbox) verkleinern bei iOS (JS-Fallback)
                                const ratio = hasNativeBarcodeDetector ? 0.85 : 0.6
                                const maxWidth = hasNativeBarcodeDetector ? 300 : 220
                                const width = Math.min(
                                    viewfinderWidth * ratio,
                                    maxWidth
                                )
                                const height = width * 0.5
                                return { width, height }
                            },
                            aspectRatio: 1.7777777778,
                        },
                        (decodedText: string, result: Html5QrcodeResult) => {
                            if (!isValidScannedBarcode(decodedText, result)) {
                                setError(
                                    'Unsicherer Scan erkannt. Bitte Barcode ruhiger und naeher scannen.'
                                )
                                return
                            }

                            if (hasScannedRef.current) return
                            hasScannedRef.current = true
                            onScan(normalizeDigits(decodedText))
                            onClose()
                        },
                        () => {}
                    )

                    try {
                        const capabilities = scanner.getRunningTrackCapabilities() as any
                        const advanced: any[] = []
                        
                        // 2. Digitalen Zoom (2x) über WebRTC-API aktivieren, falls unterstützt
                        if (capabilities?.zoom) {
                            const maxZoom = capabilities.zoom.max || 2
                            advanced.push({ zoom: Math.min(2, maxZoom) })
                        }
                        
                        // Fokus und Bildqualität optimieren
                        advanced.push({
                            focusMode: 'continuous',
                            whiteBalanceMode: 'continuous',
                            exposureMode: 'continuous',
                        })
                        
                        // Videoauflösung hier setzen, da scanner.start nur 1 Key im Config-Objekt erlaubt
                        const videoConstraints: MediaTrackConstraints = {
                            width: { ideal: 1280, max: 1920 },
                            height: { ideal: 720, max: 1080 },
                        }
                        
                        if (advanced.length > 0) {
                            videoConstraints.advanced = advanced as any
                        }
                        
                        await scanner.applyVideoConstraints(videoConstraints)
                    } catch (focusErr) {
                        console.warn('Advanced camera constraints not available:', focusErr)
                    }

                    setScannerReady(true)
                    updateTorchStateFromTrack()
                }

                transitionRef.current = start()
                await transitionRef.current
            } catch (err) {
                console.error('Error starting scanner:', err)
                setError('Could not access camera. Please check permissions.')
            } finally {
                transitionRef.current = null
            }
        }, 100)
    }, [isOpen, onClose, onScan, updateTorchStateFromTrack])

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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <Camera size={20} className="text-emerald-500" />
                        Scan Barcode
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div
                        id="scanner-modal-container"
                        className="w-full rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                        style={{
                            aspectRatio: '1.5',
                            maxHeight: '360px',
                        }}
                    >
                        {error && (
                            <p className="text-red-500 text-sm text-center px-4">
                                {error}
                            </p>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        disabled={!scannerReady || !torchSupported || torchBusy}
                        onClick={toggleTorch}
                    >
                        {torchEnabled ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                    </Button>

                    {scannerReady && !torchSupported && !error && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            Flashlight is not supported on this device/camera.
                        </p>
                    )}

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}
