'use client'

import { SerwistProvider } from '@serwist/turbopack/react'
import type { ReactNode } from 'react'

export function SerwistRegister({ children }: { children: ReactNode }) {
    return (
        <SerwistProvider
            swUrl="/serwist/sw.js"
            register={true}
            cacheOnNavigation={true}
            reloadOnOnline={false}
            disable={process.env.NODE_ENV !== 'production'}
        >
            {children}
        </SerwistProvider>
    )
}
