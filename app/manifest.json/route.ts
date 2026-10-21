import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export async function GET(request: Request) {
    const requestedLocale = new URL(request.url).searchParams.get('locale')
    const locale = hasLocale(routing.locales, requestedLocale)
        ? requestedLocale
        : routing.defaultLocale
    const t = await getTranslations({ locale, namespace: 'pwa' })
    const tCommon = await getTranslations({ locale, namespace: 'common' })

    return Response.json(
        {
            id: '/',
            name: tCommon('appName'),
            short_name: tCommon('appName'),
            description: t('description'),
            start_url: `/${locale}`,
            scope: '/',
            display: 'standalone',
            background_color: '#f8fafc',
            theme_color: '#10b981',
            lang: locale,
            dir: 'ltr',
            orientation: 'portrait-primary',
            categories: ['food', 'lifestyle', 'utilities'],
            launch_handler: { client_mode: 'navigate-existing' },
            shortcuts: (
                [
                    { key: 'fridges', path: '/fridges' },
                    { key: 'scanner', path: '/scanner' },
                    { key: 'shoppingList', path: '/shopping-list' },
                    { key: 'settings', path: '/settings' },
                ] as const
            ).map(({ key, path }) => ({
                name: t(`shortcuts.${key}`),
                url: `/${locale}${path}`,
                icons: [
                    {
                        src: '/icons/shortcut-96.png',
                        sizes: '96x96',
                        type: 'image/png',
                    },
                ],
            })),
            icons: [
                {
                    src: '/icons/manifest-icon-192.maskable.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any',
                },
                {
                    src: '/icons/manifest-icon-192.maskable.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'maskable',
                },
                {
                    src: '/icons/manifest-icon-512.maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any',
                },
                {
                    src: '/icons/manifest-icon-512.maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                },
            ],
        },
        {
            headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'public, max-age=3600',
            },
        }
    )
}
