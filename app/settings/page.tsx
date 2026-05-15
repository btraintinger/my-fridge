'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LogOut, Moon, Sun, User as UserIcon } from 'lucide-react'
import { useEffect } from 'react'

export default function Settings() {
    const { user, loading } = useAuth()
    const { darkMode, toggleDarkMode } = useTheme()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            router.push('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    if (loading || !user) return null

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-6 lg:pl-20 xl:pl-56">
            <div className="pt-safe">
            <div className="pt-12 px-4 sm:px-6 lg:px-8 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                    Settings
                </h1>
            </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="content-container max-w-2xl">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 mb-6 sm:mb-8">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                            <UserIcon size={28} className="sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 truncate">
                                {user.displayName || 'User'}
                            </h2>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                                    {darkMode ? (
                                        <Moon size={20} />
                                    ) : (
                                        <Sun size={20} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-50">
                                        Dark Mode
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {darkMode ? 'On' : 'Off'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className={`w-14 h-8 rounded-full transition-colors relative flex-shrink-0 ${darkMode ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-between text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900"
                            onClick={handleSignOut}
                        >
                            <span>Sign Out</span>
                            <LogOut size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
