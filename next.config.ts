import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { withSerwist } from '@serwist/turbopack'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

const nextConfig: NextConfig = {
    // Allows Turbopack to serve dev resources to mobile devices on the network
    // @ts-expect-error - Next.js 16 expects this for mobile dev, but types may lag
    allowedDevOrigins: ['192.168.0.175:3000', '192.168.0.175'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.openfoodfacts.org',
            },
        ],
    },
    // Proxy Firebase Auth's OAuth helper so signInWithRedirect runs same-origin.
    // Without this, Chrome 115+/Safari 16.1+/Firefox 109+ block the third-party
    // storage on *.firebaseapp.com and the redirect comes back unauthenticated.
    async rewrites() {
        if (!firebaseAuthDomain) return []
        return [
            {
                source: '/__/:path*',
                destination: `https://${firebaseAuthDomain}/__/:path*`,
            },
        ]
    },
    // Server Actions allowed origins allows cross-device requests to mutate data without CSRF errors
    experimental: {
        serverActions: {
            allowedOrigins: [
                'localhost:3000',
                '192.168.0.175:3000',
                '192.168.0.175',
            ],
        },
    },
}

export default withSerwist(withNextIntl(nextConfig))
