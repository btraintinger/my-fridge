import type { NextConfig } from 'next'

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
    // Server Actions allowed origins allows cross-device requests to mutate data without CSRF errors
    experimental: {
        serverActions: {
            allowedOrigins: [
                'localhost:3000',
                '10.164.11.98:3000',
                '10.164.11.98'
            ]
        }
    }
}

export default nextConfig
