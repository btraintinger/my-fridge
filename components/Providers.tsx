'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from './ui/ToastProvider'
import { AuthGate } from './AuthGate'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <AuthGate>{children}</AuthGate>
                <ToastProvider />
            </ThemeProvider>
        </AuthProvider>
    )
}
