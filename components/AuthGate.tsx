'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'

const PUBLIC_ROUTES = new Set(['/login', '/register'])
const AUTHED_HOME = '/fridges'
const UNAUTHED_HOME = '/login'

function Spinner() {
    return (
        <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    )
}

export function AuthGate({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    const isPublicRoute = PUBLIC_ROUTES.has(pathname)
    const needsRedirect =
        !loading && ((isPublicRoute && !!user) || (!isPublicRoute && !user))

    useEffect(() => {
        router.prefetch(AUTHED_HOME)
        router.prefetch(UNAUTHED_HOME)
    }, [router])

    useEffect(() => {
        if (!needsRedirect) return
        router.replace(isPublicRoute ? AUTHED_HOME : UNAUTHED_HOME)
    }, [needsRedirect, isPublicRoute, router])

    if (loading || needsRedirect) {
        return <Spinner />
    }

    return <>{children}</>
}
