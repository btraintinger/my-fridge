'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/components/feedback/ToastProvider'
import { AuthGate } from '@/components/auth/AuthGate'
import { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <TooltipProvider delayDuration={300}>
                    <AuthGate>{children}</AuthGate>
                    <ToastProvider />
                </TooltipProvider>
            </ThemeProvider>
        </AuthProvider>
    )
}
