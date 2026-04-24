'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Camera, X } from 'lucide-react'
import { Button } from './ui/Button'

interface ScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onScan: (barcode: string) => void
}

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
    const [error, setError] = useState('')
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const transitionRef = useRef<Promise<void> | null>(null)

    const stopScanner = useCallback(async () => {
        try {
            if (transitionRef.current) await transitionRef.current

            const stop = async () => {
                if (scannerRef.current) {
                    if (scannerRef.current.isScanning) {
                        await scannerRef.current.stop()
                    }
                    scannerRef.current.clear()
                    scannerRef.current = null
                }
            }

            transitionRef.current = stop()
            await transitionRef.current
        } catch (err) {
            console.error('Error stopping scanner:', err)
        } finally {
            transitionRef.current = null
        }
    }, [])

    const startScanner = useCallback(async () => {
        setError('')

        // Tiny delay to ensure the container is in the DOM
        setTimeout(async () => {
            if (!isOpen) return // Don't start if it's already closed

            try {
                if (transitionRef.current) await transitionRef.current

                const start = async () => {
                    if (scannerRef.current) {
                        if (scannerRef.current.isScanning) return
                        scannerRef.current.clear()
                    }

                    const scanner = new Html5Qrcode('scanner-modal-container', {
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.EAN_13,
                            Html5QrcodeSupportedFormats.EAN_8,
                            Html5QrcodeSupportedFormats.CODE_128,
                            Html5QrcodeSupportedFormats.CODE_39,
                            Html5QrcodeSupportedFormats.UPC_A,
                            Html5QrcodeSupportedFormats.UPC_E,
                        ],
                        verbose: false,
                    })
                    scannerRef.current = scanner

                    await scanner.start(
                        { facingMode: 'environment' },
                        {
                            fps: 15,
                            qrbox: (viewfinderWidth) => {
                                const width = Math.min(
                                    viewfinderWidth * 0.8,
                                    300
                                )
                                const height = width * 0.5
                                return { width, height }
                            },
                            aspectRatio: 1.333334,
                        },
                        (decodedText: string) => {
                            onScan(decodedText)
                            onClose()
                        },
                        () => {}
                    )
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
    }, [isOpen, onClose, onScan])

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
                        className="w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
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
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}
