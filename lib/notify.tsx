'use client'

import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

const TOAST_STYLES: Record<ToastType, { wrapper: string; icon: ReactNode }> = {
    success: {
        wrapper:
            'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200',
        icon: <CheckCircle size={18} />,
    },
    error: {
        wrapper:
            'bg-red-50 dark:bg-red-950/90 border-red-100 dark:border-red-900 text-red-800 dark:text-red-200',
        icon: <AlertCircle size={18} />,
    },
    info: {
        wrapper:
            'bg-blue-50 dark:bg-blue-950/90 border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-200',
        icon: <Info size={18} />,
    },
    warning: {
        wrapper:
            'bg-amber-50 dark:bg-amber-950/90 border-amber-100 dark:border-amber-900 text-amber-800 dark:text-amber-200',
        icon: <AlertTriangle size={18} />,
    },
}

function show(type: ToastType, message: string, duration?: number) {
    const style = TOAST_STYLES[type]
    return toast.custom(
        (t) => (
            <div
                className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg border w-full max-w-sm ${
                    t.visible
                        ? 'animate-in slide-in-from-bottom-4 fade-in duration-300'
                        : 'animate-out slide-out-to-bottom-4 fade-out duration-200'
                } ${style.wrapper}`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0">{style.icon}</span>
                    <p className="text-sm font-medium truncate">{message}</p>
                </div>
                <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                    aria-label="Dismiss"
                >
                    <X size={14} />
                </button>
            </div>
        ),
        { duration: duration ?? (type === 'error' ? 5000 : 3000) }
    )
}

export const notify = {
    success: (message: string, duration?: number) =>
        show('success', message, duration),
    error: (err: string | Error, duration?: number) => {
        const message = err instanceof Error ? err.message : err
        console.error('Notify error:', err)
        return show('error', message, duration)
    },
    info: (message: string, duration?: number) =>
        show('info', message, duration),
    warning: (message: string, duration?: number) =>
        show('warning', message, duration),
    dismiss: (id?: string) => toast.dismiss(id),
}
