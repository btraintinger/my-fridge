import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import '../globals.css'
import { Providers } from '../../components/Providers'
import Navigation from '../../components/ui/Navigation'
import { PWAClient } from '../../components/PWAClient'
import { routing } from '../../i18n/routing'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale: locale as (typeof routing.locales)[number], namespace: 'common' })
    return {
        title: t('appName'),
        description: t('appTagline'),
        appleWebApp: {
            capable: true,
            statusBarStyle: 'black-translucent',
            title: t('appName'),
        },
        formatDetection: {
            telephone: false,
        },
    }
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

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    setRequestLocale(locale)
    const messages = await getMessages()

    return (
        <html
            lang={locale}
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
            data-scroll-behavior="smooth"
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
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <Providers>
                        <div className="flex-1 flex flex-col lg:flex-row">
                            <div className="flex-1 flex flex-col min-w-0">
                                {children}
                            </div>
                        </div>
                        <PWAClient />
                        <Navigation />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
