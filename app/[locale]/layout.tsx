import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import {
    getMessages,
    getTranslations,
    setRequestLocale,
} from 'next-intl/server'
import '@/app/globals.css'
import { Providers } from '@/components/Providers'
import Navigation from '@/components/layout/Navigation'
import { SerwistRegister } from '@/components/pwa/SerwistRegister'
import { InstallButton } from '@/components/pwa/InstallButton'
import { routing } from '@/i18n/routing'
import { AppleSplashLinks } from '@/components/pwa/AppleSplashLinks'

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
    const t = await getTranslations({
        locale: locale as (typeof routing.locales)[number],
        namespace: 'common',
    })
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
    const tCommon = await getTranslations('common')

    return (
        <html
            lang={locale}
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
            data-scroll-behavior="smooth"
        >
            <head>
                <link rel="manifest" href={`/manifest.json?locale=${locale}`} />
                <link rel="icon" href="/favicon.ico" sizes="32x32" />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="196x196"
                    href="/icons/favicon-196.png"
                />
                <link
                    rel="icon"
                    href="/icons/icon-512.svg"
                    sizes="any"
                    type="image/svg+xml"
                />
                <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
                <meta
                    name="msapplication-square70x70logo"
                    content="/icons/mstile-icon-128.png"
                />
                <meta
                    name="msapplication-square150x150logo"
                    content="/icons/mstile-icon-270.png"
                />
                <meta
                    name="msapplication-square310x310logo"
                    content="/icons/mstile-icon-558.png"
                />
                <meta
                    name="msapplication-wide310x150logo"
                    content="/icons/mstile-icon-558-270.png"
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-title"
                    content={tCommon('appName')}
                />
                <AppleSplashLinks />
            </head>
            <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 overflow-x-hidden">
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <SerwistRegister>
                        <Providers>
                            <div className="flex-1 flex flex-col lg:flex-row">
                                <div className="flex-1 flex flex-col min-w-0">
                                    {children}
                                </div>
                            </div>
                            <InstallButton />
                            <Navigation />
                        </Providers>
                    </SerwistRegister>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
