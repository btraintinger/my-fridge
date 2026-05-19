import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
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
                '192.168.0.175:3000',
                '192.168.0.175'
            ]
        }
    }
}

export default nextConfig
