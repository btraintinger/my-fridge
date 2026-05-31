import { createSerwistRoute } from '@serwist/turbopack'

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
    createSerwistRoute({
        additionalPrecacheEntries: [
            { url: '/en/offline', revision: null },
            { url: '/de/offline', revision: null },
        ],
        swSrc: 'app/sw.ts',
        useNativeEsbuild: true,
        esbuildOptions: {
            define: {
                'process.env.NEXT_PUBLIC_FIREBASE_API_KEY': JSON.stringify(
                    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''
                ),
                'process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(
                    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? ''
                ),
                'process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(
                    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ''
                ),
                'process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET':
                    JSON.stringify(
                        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? ''
                    ),
                'process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID':
                    JSON.stringify(
                        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
                            ''
                    ),
                'process.env.NEXT_PUBLIC_FIREBASE_APP_ID': JSON.stringify(
                    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ''
                ),
            },
        },
    })
