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
        <nav className="fixed bottom-0 w-full glass pb-safe pb-4 z-50">
            <div className="max-w-md mx-auto px-6 flex justify-between items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${
                                isActive
                                    ? 'text-emerald-600 dark:text-emerald-400 scale-105'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            <div
                                className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/50 shadow-sm' : 'bg-transparent'}`}
                            >
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span
                                className={`text-[10px] font-bold mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-70 font-medium'}`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
