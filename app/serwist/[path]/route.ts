import { createSerwistRoute } from '@serwist/turbopack'

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
    createSerwistRoute({
        additionalPrecacheEntries: [
            { url: '/en/offline', revision: null },
            { url: '/de/offline', revision: null },
            { url: '/manifest.json', revision: null },
        ],
        swSrc: 'app/sw.ts',
        useNativeEsbuild: true,
    })
