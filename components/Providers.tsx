'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <ThemeProvider>{children}</ThemeProvider>
            </NotificationProvider>
        </AuthProvider>
    )
}
