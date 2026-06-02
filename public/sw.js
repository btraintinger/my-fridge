const CACHE_VERSION = 'v1'
const STATIC_CACHE = `myfridge-static-${CACHE_VERSION}`
const PAGE_CACHE = `myfridge-pages-${CACHE_VERSION}`
const IMAGE_CACHE = `myfridge-images-${CACHE_VERSION}`
const API_CACHE = `myfridge-api-${CACHE_VERSION}`

const OFFLINE_ASSETS = ['/manifest.json', '/icons/icon-192.svg', '/icons/icon-512.svg', '/icons/apple-touch-icon.svg']

function sameOrigin(url) {
    return new URL(url).origin === self.location.origin
}

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)
    if (cached) return cached

    const response = await fetch(request)
    if (response.ok) {
        cache.put(request, response.clone())
    }
    return response
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)
    const networkPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone())
            }
            return response
        })
        .catch(() => cached)

    return cached || networkPromise
}

async function networkFirst(request, cacheName, fallbackUrl) {
    const cache = await caches.open(cacheName)
    try {
        const response = await fetch(request)
        if (response.ok) {
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        const cached = await cache.match(request)
        if (cached) return cached

        if (fallbackUrl) {
            const fallback = await caches.match(fallbackUrl)
            if (fallback) return fallback
        }

        throw error
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const staticCache = await caches.open(STATIC_CACHE)
            await staticCache.addAll(OFFLINE_ASSETS)

            const pageCache = await caches.open(PAGE_CACHE)
            const offlinePage = await fetch('/offline')
            if (offlinePage.ok) {
                await pageCache.put('/offline', offlinePage.clone())
            }

            await caches.open(IMAGE_CACHE)
            await caches.open(API_CACHE)
            self.skipWaiting()
        })()
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys()
            await Promise.all(
                keys
                    .filter((key) => !key.endsWith(CACHE_VERSION))
                    .map((key) => caches.delete(key))
            )
            await self.clients.claim()
        })()
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event

    if (request.method !== 'GET') return

    const url = new URL(request.url)

    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirst(request, PAGE_CACHE, '/offline'))
        return
    }

    if (!sameOrigin(request.url)) {
        if (request.destination === 'image') {
            event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE))
        }
        return
    }

    if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.woff2')) {
        event.respondWith(cacheFirst(request, STATIC_CACHE))
        return
    }

    if (url.pathname.startsWith('/_next/image') || request.destination === 'image') {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE))
        return
    }

    if (url.pathname.startsWith('/api/openfoodfacts/')) {
        event.respondWith(networkFirst(request, API_CACHE, null))
        return
    }
})
