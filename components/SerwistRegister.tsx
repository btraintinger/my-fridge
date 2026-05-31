'use client'

import { SerwistProvider } from '@serwist/turbopack/react'
import { useEffect, type ReactNode } from 'react'

const SERWIST_SW_PATH = '/serwist/sw.js'

export function SerwistRegister({ children }: { children: ReactNode }) {
    // One-time cleanup of any stale service workers from before the Serwist
    // switch (e.g. the old /sw.js). Without this they keep controlling the
    // page because the browser only swaps SWs when a new registration with
    // the same scriptURL succeeds.
    useEffect(() => {
        if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
        navigator.serviceWorker
            .getRegistrations()
            .then((registrations) => {
                for (const reg of registrations) {
                    const scriptURL =
                        reg.active?.scriptURL ??
                        reg.waiting?.scriptURL ??
                        reg.installing?.scriptURL ??
                        ''
                    if (scriptURL && !scriptURL.endsWith(SERWIST_SW_PATH)) {
                        reg.unregister().catch(() => {})
                    }
                }
            })
            .catch(() => {})
    }, [])

    return (
        <SerwistProvider
            swUrl={SERWIST_SW_PATH}
            register={true}
            cacheOnNavigation={true}
            reloadOnOnline={false}
            disable={false}
        >
            {children}
        </SerwistProvider>
    )
}
