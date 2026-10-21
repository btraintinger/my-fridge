import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
    type CameraDevice,
} from 'html5-qrcode'
import { useTranslations } from 'next-intl'
import {
    SCANNER_CONTAINER_ID,
    clearScannerContainer,
    normalizeDigits,
    pickBackCameraIndex,
    applyCameraConstraints,
    type ExtendedCapabilities,
    type CameraConfig,
} from '@/components/scanner/camera'

interface BarcodeScannerOptions {
    isOpen: boolean
    onClose: () => void
    onScan: (barcode: string) => void
    isMultiScan?: boolean
}

export function useBarcodeScanner({
    isOpen,
    onClose,
    onScan,
    isMultiScan,
}: BarcodeScannerOptions) {
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
                        await applyCameraConstraints(scanner, caps)
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
        if (!isOpen) void stopScanner()
        return () => {
            stopScanner()
        }
    }, [isOpen, stopScanner])

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

    return {
        scannerReady,
        error,
        torchSupported,
        torchEnabled,
        torchBusy,
        optimizationState,
        startScanner,
        switchCamera,
        toggleTorch,
    }
}
