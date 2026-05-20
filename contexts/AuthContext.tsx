'use client'

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'
import { getRedirectResult, onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { userService } from '../lib/services/userService'

interface AuthContextType {
    user: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRedirectResult(auth).catch(console.error)

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const hasPasswordProvider =
                user?.providerData.some(
                    (provider) => provider.providerId === 'password'
                ) ?? false

            if (user && hasPasswordProvider && !user.emailVerified) {
                await signOut(auth)
                setUser(null)
                setLoading(false)
                return
            }

            setUser(user)

            if (user) {
                try {
                    await userService.ensureUserPreferencesDocument(user.uid)
                } catch (error) {
                    console.error(
                        'Failed to initialize user preferences document:',
                        error
                    )
                }
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
