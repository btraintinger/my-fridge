'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ToastProvider } from './ui/ToastProvider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <ThemeProvider>
                    {children}
                    <ToastProvider />
                </ThemeProvider>
            </NotificationProvider>
        </AuthProvider>
    )
}
