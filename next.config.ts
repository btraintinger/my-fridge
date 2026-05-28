import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

const nextConfig: NextConfig = {
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
}

export default withNextIntl(nextConfig)
