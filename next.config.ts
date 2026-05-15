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
    allowedDevOrigins: [
        'localhost:3000',
        '192.168.178.28',
        '192.168.178.28:3000',
        '0.0.0.0',
        '0.0.0.0:3000',
        'https://localhost:3000',
        'https://192.168.178.28:3000',
        'https://0.0.0.0:3000'
    ],
    experimental: {
        serverActions: {
            allowedOrigins: [
                'localhost:3000',
                '192.168.178.28:3000',
                '192.168.178.28'
            ]
        },
        allowedDevOrigins: [
            'localhost:3000',
            '192.168.178.28',
            '192.168.178.28:3000',
            '0.0.0.0:3000',
            'https://localhost:3000',
            'https://192.168.178.28:3000'
        ]
    }
}

export default nextConfig
