'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListPlus, ScanLine, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
    const pathname = usePathname()
    const { user } = useAuth()

    if (!user) return null

    const navItems = [
        { href: '/fridges', icon: Home, label: 'Fridges' },
        { href: '/scanner', icon: ScanLine, label: 'Scan' },
        { href: '/shopping-list', icon: ListPlus, label: 'List' },
        { href: '/settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <>
            {/* ─── Mobile / Tablet: Bottom bar ─── */}
            <nav className="fixed bottom-0 left-0 right-0 glass pb-safe z-50 lg:hidden">
                <div className="max-w-lg mx-auto px-4 sm:px-8 flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
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
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </div>
                                <span
                                    className={`text-[10px] font-bold mt-0.5 transition-all ${isActive ? 'opacity-100' : 'opacity-70 font-medium'}`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* ─── Desktop: Left sidebar ─── */}
            <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 xl:w-56 flex-col items-center xl:items-stretch bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-8 px-2 xl:px-4 z-50">
                <div className="mb-10 flex items-center justify-center xl:justify-start gap-3 px-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                        <ScanLine size={20} />
                    </div>
                    <span className="hidden xl:block text-lg font-bold text-slate-900 dark:text-slate-50">
                        MyFridge
                    </span>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className="flex-shrink-0 mx-auto xl:mx-0"
                                />
                                <span
                                    className={`hidden xl:block text-sm font-semibold transition-colors ${isActive ? '' : 'group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
