'use client'

import { useEffect, useState } from 'react'
import { Download, RefreshCw, WifiOff } from 'lucide-react'
import {
    flushOfflineMutations,
    getOfflineMutationCount,
} from '@/lib/offlineQueue'
import { Button } from './ui/Button'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PWAClient() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null)
    const [isStandalone] = useState(() => {
        if (typeof window === 'undefined') return false

        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone ===
                true
        )
    })
    const [online, setOnline] = useState(() => {
        if (typeof navigator === 'undefined') return true
        return navigator.onLine
    })
    const [pendingMutations, setPendingMutations] = useState(() =>
        getOfflineMutationCount()
    )

    useEffect(() => {
        if (typeof window === 'undefined') return

        const updatePendingCount = () => {
            setPendingMutations(getOfflineMutationCount())
        }

        const requestBackgroundSync = async () => {
            if (!('serviceWorker' in navigator)) return

            try {
                const registration = await navigator.serviceWorker.ready
                if ('sync' in registration) {
                    await registration.sync.register('offline-changes')
                }
            } catch (error) {
                console.warn('Background sync registration failed:', error)
            }
        }

        const registerServiceWorker = async () => {
            if (!('serviceWorker' in navigator)) return

            try {
                await navigator.serviceWorker.register('/sw.js')
            } catch (error) {
                console.warn('Service worker registration failed:', error)
            }
        }

        const handleOnline = () => {
            setOnline(true)
            void flushOfflineMutations().then(() => {
                updatePendingCount()
                void requestBackgroundSync()
            })
        }

        const handleOffline = () => setOnline(false)
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setDeferredPrompt(event as BeforeInstallPromptEvent)
        }

        const handleAppInstalled = () => setDeferredPrompt(null)
        const handleQueueUpdate = () => updatePendingCount()
        const handleSwMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SYNC_OFFLINE_MUTATIONS') {
                void flushOfflineMutations().then(() => {
                    updatePendingCount()
                    void requestBackgroundSync()
                })
            }
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt as EventListener
        )
        window.addEventListener('appinstalled', handleAppInstalled)
        window.addEventListener(
            'myfridge-offline-mutations-updated',
            handleQueueUpdate
        )
        navigator.serviceWorker?.addEventListener('message', handleSwMessage)

        void registerServiceWorker()

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt as EventListener
            )
            window.removeEventListener('appinstalled', handleAppInstalled)
            window.removeEventListener(
                'myfridge-offline-mutations-updated',
                handleQueueUpdate
            )
            navigator.serviceWorker?.removeEventListener(
                'message',
                handleSwMessage
            )
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
            setDeferredPrompt(null)
        }
    }

    const handleSyncNow = async () => {
        await flushOfflineMutations()
        setPendingMutations(0)
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready
            if ('sync' in registration) {
                try {
                    await registration.sync.register('offline-changes')
                } catch (error) {
                    console.warn('Background sync registration failed:', error)
                }
            }
        }
    }

    const showControls = !isStandalone || !online || pendingMutations > 0
    if (!showControls) return null

    return (
        <div className="fixed right-4 bottom-24 z-50 flex flex-col items-end gap-3 max-w-[calc(100vw-2rem)]">
            {!online && (
                <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 shadow-lg dark:border-amber-900/60 dark:bg-amber-950/90 dark:text-amber-200">
                    <WifiOff size={16} />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                        Offline
                    </span>
                </div>
            )}

            {pendingMutations > 0 && (
                <button
                    type="button"
                    onClick={handleSyncNow}
                    className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-left shadow-xl dark:border-emerald-900/60 dark:bg-slate-900"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                        <RefreshCw size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {pendingMutations} Änderungen warten auf Sync
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sobald wieder Verbindung besteht, werden sie mit Firestore abgeglichen.
                        </p>
                    </div>
                </button>
            )}

            {deferredPrompt && !isStandalone && (
                <Button
                    type="button"
                    onClick={handleInstall}
                    className="shadow-xl"
                >
                    <Download size={18} className="mr-2" />
                    Add to Home Screen
                </Button>
            )}
        </div>
    )
}
