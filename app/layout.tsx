import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '../components/Providers'
import Navigation from '../components/ui/Navigation'
import { PWAClient } from '../components/PWAClient'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'MyFridge',
    description: 'Digital fridge management application',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'MyFridge',
    },
    formatDetection: {
        telephone: false,
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="de"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/icons/icon-192.svg" sizes="192x192" />
                <link rel="icon" href="/icons/icon-512.svg" sizes="512x512" />
                <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-title" content="MyFridge" />
            </head>
            <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 overflow-x-hidden">
                <Providers>
                    <div className="flex-1 flex flex-col lg:flex-row">
                        <div className="flex-1 flex flex-col min-w-0">{children}</div>
                    </div>
                    <PWAClient />
                    <Navigation />
                </Providers>
            </body>
        </html>
    )
}
