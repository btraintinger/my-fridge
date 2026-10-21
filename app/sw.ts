/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from '@serwist/turbopack/worker'
import { type PrecacheEntry, type SerwistGlobalConfig, Serwist } from 'serwist'
import en from '@/messages/en.json'
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
    }
}

declare const self: ServiceWorkerGlobalScope

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

try {
    const firebaseApp = getApps().length
        ? getApps()[0]
        : initializeApp(firebaseConfig)
    const messaging = getMessaging(firebaseApp)
    onBackgroundMessage(messaging, (payload) => {
        const title = payload.data?.title ?? en.common.appName
        const body = payload.data?.body ?? ''
        const link = payload.data?.link ?? '/'
        self.registration.showNotification(title, {
            body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            data: { link },
            tag: payload.data?.tag,
        })
    })
} catch (err) {
    console.error('[sw] firebase messaging init failed', err)
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const link =
        (event.notification.data as { link?: string } | null)?.link ?? '/'
    event.waitUntil(
        (async () => {
            const all = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            })
            const existing = all.find((c) => c.url.includes(link))
            if (existing) {
                await existing.focus()
                return
            }
            await self.clients.openWindow(link)
        })()
    )
})

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
    fallbacks: {
        entries: [
            {
                url: '/de/offline',
                matcher: ({ request }) =>
                    request.destination === 'document' &&
                    new URL(request.url).pathname.startsWith('/de'),
            },
            {
                url: '/en/offline',
                matcher: ({ request }) => request.destination === 'document',
            },
        ],
    },
})

serwist.addEventListeners()
