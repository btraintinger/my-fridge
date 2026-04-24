'use client'

import {
    createContext,
    useCallback,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'
import { useAuth } from './AuthContext'
import { userService } from '../lib/services/userService'

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
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false

        return (
            localStorage.getItem('darkMode') === 'true' ||
            (!('darkMode' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
        )
    })

    useEffect(() => {
        // Update HTML class
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    const toggle = useCallback(async () => {
        const newValue = !darkMode
        setDarkMode(newValue)
        localStorage.setItem('darkMode', String(newValue))

        if (user) {
            try {
                await userService.updateUserPreferences(user.uid, {
                    darkMode: newValue,
                })
            } catch (error) {
                console.error('Failed to update dark mode preference:', error)
            }
        }
    }, [darkMode, user])

    useEffect(() => {
        if (loading || !user) return

        // Subscribe to user preferences in Firestore
        const unsubscribe = userService.subscribeToUserPreferences(
            user.uid,
            (prefs) => {
                if (typeof prefs.darkMode === 'boolean') {
                    setDarkMode(prefs.darkMode)
                    localStorage.setItem('darkMode', String(prefs.darkMode))
                }
            },
            (error) => {
                console.error('Error fetching user preferences:', error)
            }
        )

        return () => unsubscribe()
    }, [loading, user])

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode: toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
