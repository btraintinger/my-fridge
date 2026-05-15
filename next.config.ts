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
    experimental: {
        allowedDevOrigins: ['https://localhost:3000', 'https://192.168.178.28:3000'],
    },
}

export default nextConfig
