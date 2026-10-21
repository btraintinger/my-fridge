'use client'

import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Link, usePathname } from '@/i18n/navigation'
import { Home, ListPlus, ScanLine, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
    const pathname = usePathname()
    const { user } = useAuth()
    const t = useTranslations('nav')
    const tCommon = useTranslations('common')

    if (!user) return null

    const navItems = [
        { href: '/fridges', icon: Home, label: t('fridges') },
        { href: '/scanner', icon: ScanLine, label: t('scan') },
        { href: '/shopping-list', icon: ListPlus, label: t('list') },
        { href: '/settings', icon: Settings, label: t('settings') },
    ]

    return (
        <>
            {/* ─── Mobile / Tablet: Bottom bar ─── */}
            <NavigationMenu
                viewport={false}
                className="fixed bottom-0 left-0 right-0 block max-w-none flex-none glass pb-safe z-40 lg:hidden"
            >
                <NavigationMenuList className="max-w-lg w-full mx-auto px-4 sm:px-8 flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        const Icon = item.icon

                        return (
                            <NavigationMenuItem key={item.href}>
                                <NavigationMenuLink
                                    asChild
                                    active={isActive}
                                    className="gap-0 p-0 hover:bg-transparent focus:bg-transparent data-[active=true]:text-emerald-600 dark:data-[active=true]:text-emerald-400"
                                >
                                    <Link
                                        href={item.href}
                                        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-300 ${
                                            isActive
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        <div
                                            className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/50 shadow-sm scale-110' : 'bg-transparent'}`}
                                        >
                                            <Icon
                                                size={20}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                className="size-5 text-inherit"
                                            />
                                        </div>
                                        <span
                                            className={`text-[11px] leading-4 font-bold mt-0.5 transition-all ${isActive ? 'opacity-100' : 'opacity-70 font-medium'}`}
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )
                    })}
                </NavigationMenuList>
            </NavigationMenu>

            {/* ─── Desktop: Left sidebar ─── */}
            <NavigationMenu
                viewport={false}
                orientation="vertical"
                className="max-w-none flex-none hidden lg:flex fixed left-0 top-0 bottom-0 w-20 xl:w-56 flex-col justify-start items-center xl:items-stretch bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-8 px-2 xl:px-4 z-40"
            >
                <div className="mb-10 flex items-center justify-center xl:justify-start gap-3 px-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <ScanLine size={20} />
                    </div>
                    <span className="hidden xl:block text-lg font-bold text-slate-900 dark:text-slate-50">
                        {tCommon('appName')}
                    </span>
                </div>

                <NavigationMenuList className="w-full flex-1 flex-col items-stretch justify-start gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        const Icon = item.icon

                        return (
                            <NavigationMenuItem key={item.href}>
                                <NavigationMenuLink
                                    asChild
                                    active={isActive}
                                    className="p-0 hover:bg-transparent focus:bg-transparent data-[active=true]:text-emerald-600 dark:data-[active=true]:text-emerald-400"
                                >
                                    <Link
                                        href={item.href}
                                        className={`flex flex-row items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                            isActive
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        <Icon
                                            size={20}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className="size-5 flex-shrink-0 mx-auto xl:mx-0 text-inherit"
                                        />
                                        <span
                                            className={`hidden xl:block text-[15px] leading-5 font-semibold transition-colors ${isActive ? '' : 'group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </>
    )
}
