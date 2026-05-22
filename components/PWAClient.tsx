'use client'

import { useEffect, useState } from 'react'
import { Download, WifiOff } from 'lucide-react'
import { Button } from './ui/Button'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PWAClient() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null)
    const [isStandalone, setIsStandalone] = useState(false)
    const [online, setOnline] = useState(true)

    useEffect(() => {
        if (typeof window === 'undefined') return

        setIsStandalone(
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true
        )
        setOnline(navigator.onLine)

        const registerServiceWorker = async () => {
            if (!('serviceWorker' in navigator)) return
            if (process.env.NODE_ENV !== 'production') return

            try {
                // PWA Service Worker deactivated as requested by user
                // await navigator.serviceWorker.register('/sw.js')
                
                // Unregister any existing service workers to ensure it's fully disabled
                const registrations = await navigator.serviceWorker.getRegistrations()
                for (const registration of registrations) {
                    await registration.unregister()
                    console.log('Unregistered existing service worker')
                }
            } catch (error) {
                console.warn('Service worker unregistration failed:', error)
            }
        }

        const handleOnline = () => setOnline(true)
        const handleOffline = () => setOnline(false)
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setDeferredPrompt(event as BeforeInstallPromptEvent)
        }
        const handleAppInstalled = () => setDeferredPrompt(null)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt as EventListener
        )
        window.addEventListener('appinstalled', handleAppInstalled)

        void registerServiceWorker()

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt as EventListener
            )
            window.removeEventListener('appinstalled', handleAppInstalled)
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

    const showInstallButton = deferredPrompt && !isStandalone

    return (
        <>
            {!online && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed left-1/2 top-0 z-50 -translate-x-1/2 pt-safe pointer-events-none"
                >
                    <div className="mt-2 flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/95 px-3 py-1.5 text-amber-800 shadow-md backdrop-blur dark:border-amber-900/60 dark:bg-amber-950/90 dark:text-amber-200">
                        <WifiOff size={14} />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                            Offline
                        </span>
                    </div>
                </div>
            )}

            {showInstallButton && (
                <div className="fixed right-4 bottom-24 z-50 max-w-[calc(100vw-2rem)]">
                    <Button
                        type="button"
                        onClick={handleInstall}
                        className="shadow-xl"
                    >
                        <Download size={18} className="mr-2" />
                        Add to Home Screen
                    </Button>
                </div>
            )}
        </>
    )
}
