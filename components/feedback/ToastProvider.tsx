'use client'

import { Toaster } from '@/components/ui/sonner'

export function ToastProvider() {
    return (
        <Toaster
            position="bottom-center"
            gap={8}
            offset="calc(6rem + env(safe-area-inset-bottom))"
            mobileOffset="calc(6rem + env(safe-area-inset-bottom))"
            richColors
        />
    )
}
