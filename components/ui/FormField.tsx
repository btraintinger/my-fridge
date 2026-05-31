'use client'

import { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface FormFieldProps {
    label: string
    required?: boolean
    error?: string
    children: ReactNode
}

export function FormField({
    label,
    required,
    error,
    children,
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                {label}
                {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {error}
                </p>
            )}
        </div>
    )
}
