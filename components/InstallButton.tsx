'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from './ui/Button'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isStandalone] = useState(() =>
        typeof window !== 'undefined' && (
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true
        )
    )
    const t = useTranslations('offline')

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setDeferredPrompt(event as BeforeInstallPromptEvent)
        }
        const handleAppInstalled = () => setDeferredPrompt(null)

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
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

    if (!deferredPrompt || isStandalone) return null

    return (
        <div className="fixed right-4 bottom-24 z-50 max-w-[calc(100vw-2rem)]">
            <Button type="button" onClick={handleInstall} className="shadow-xl">
                <Download size={18} className="mr-2" />
                {t('installCta')}
            </Button>
        </div>
    )
}
