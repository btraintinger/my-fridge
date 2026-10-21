'use client'

import { SerwistProvider } from '@serwist/turbopack/react'
import { type ReactNode } from 'react'

const SERWIST_SW_PATH = '/serwist/sw.js'

export function SerwistRegister({ children }: { children: ReactNode }) {
    return (
        <SerwistProvider
            swUrl={SERWIST_SW_PATH}
            register={true}
            cacheOnNavigation={true}
            reloadOnOnline={false}
            disable={process.env.NODE_ENV === 'development'}
        >
            {children}
        </SerwistProvider>
    )
}
