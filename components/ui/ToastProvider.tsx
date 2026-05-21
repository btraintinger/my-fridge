'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
    return (
        <Toaster
            position="bottom-center"
            gutter={8}
            containerStyle={{ bottom: '6rem' }}
        />
    )
}
