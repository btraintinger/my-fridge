'use client'

import {
    createContext,
    useCallback,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useAuth } from './AuthContext'
import {
    subscribeToUserPreferences,
    updateUserPreferences,
} from '../lib/services/userService'

interface ThemeContextType {
    darkMode: boolean
    toggleDarkMode: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
    darkMode: false,
    toggleDarkMode: async () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false

        return (
            localStorage.getItem('darkMode') === 'true' ||
            (!('darkMode' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
        )
    })

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    const toggle = useCallback(async () => {
        setDarkMode((prev) => {
            const newValue = !prev
            localStorage.setItem('darkMode', String(newValue))

            if (user) {
                void updateUserPreferences(user.uid, {
                    darkMode: newValue,
                }).catch((error) => {
                    console.error(
                        'Failed to update dark mode preference:',
                        error
                    )
                })
            }

            return newValue
        })
    }, [user])

    useEffect(() => {
        if (loading || !user) return

        const unsubscribe = subscribeToUserPreferences(
            user.uid,
            (prefs, metadata) => {
                if (metadata.hasPendingWrites) return

                if (typeof prefs.darkMode === 'boolean') {
                    setDarkMode(prefs.darkMode)
                    localStorage.setItem('darkMode', String(prefs.darkMode))
                }

                if (prefs.locale && prefs.locale !== locale) {
                    router.replace(pathname, { locale: prefs.locale })
                }
            },
            (error) => {
                console.error('Error fetching user preferences:', error)
            }
        )

        return () => unsubscribe()
        // pathname and router are stable refs; locale is intentionally excluded so
        // we only redirect once on the initial subscription, not on every locale change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user])

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode: toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
