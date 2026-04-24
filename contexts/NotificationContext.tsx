'use client'

import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fridgeService, productService } from '@/lib/services/fridgeService'
import { userService } from '@/lib/services/userService'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface NotificationContextType {
    notify: (message: string, type?: ToastType, duration?: number) => void
    success: (message: string, duration?: number) => void
    error: (message: string | Error, duration?: number) => void
    info: (message: string, duration?: number) => void
    warn: (message: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const notify = useCallback(
        (message: string, type: ToastType = 'info', duration = 3000) => {
            const id = Math.random().toString(36).substring(2, 9)
            setToasts((prev) => [...prev, { id, message, type, duration }])

            if (duration !== Infinity) {
                setTimeout(() => removeToast(id), duration)
            }
        },
        [removeToast]
    )

    const success = useCallback(
        (msg: string, dur?: number) => notify(msg, 'success', dur),
        [notify]
    )

    const error = useCallback(
        (err: string | Error, dur?: number) => {
            const message = err instanceof Error ? err.message : err
            console.error('Notification Error:', err)
            notify(message, 'error', dur ?? 5000)
        },
        [notify]
    )

    const info = useCallback(
        (msg: string, dur?: number) => notify(msg, 'info', dur),
        [notify]
    )
    const warn = useCallback(
        (msg: string, dur?: number) => notify(msg, 'warning', dur),
        [notify]
    )

    useEffect(() => {
        const config = { notifySuccess: success, notifyError: error }
        fridgeService.init(config)
        productService.init(config)
        userService.init(config)
    }, [success, error])

    return (
        <NotificationContext.Provider
            value={{ notify, success, error, info, warn }}
        >
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            'pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg border animate-in slide-in-from-bottom-4 fade-in duration-300',
                            toast.type === 'success' &&
                                'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200',
                            toast.type === 'error' &&
                                'bg-red-50 dark:bg-red-950/90 border-red-100 dark:border-red-900 text-red-800 dark:text-red-200',
                            toast.type === 'info' &&
                                'bg-blue-50 dark:bg-blue-950/90 border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-200',
                            toast.type === 'warning' &&
                                'bg-amber-50 dark:bg-amber-950/90 border-amber-100 dark:border-amber-900 text-amber-800 dark:text-amber-200'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {toast.type === 'success' && (
                                <CheckCircle size={18} />
                            )}
                            {toast.type === 'error' && (
                                <AlertCircle size={18} />
                            )}
                            {toast.type === 'info' && <Info size={18} />}
                            {toast.type === 'warning' && (
                                <AlertTriangle size={18} />
                            )}
                            <p className="text-sm font-medium">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error(
            'useNotification must be used within a NotificationProvider'
        )
    }
    return context
}
