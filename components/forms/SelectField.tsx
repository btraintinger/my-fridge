'use client'

import type { AriaAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
    Select as SelectRoot,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export interface SelectOption {
    value: string
    label: string
}

export interface SelectProps extends AriaAttributes {
    id?: string
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    icon?: ReactNode
    error?: boolean
    disabled?: boolean
    className?: string
    size?: 'sm' | 'md'
}

// Radix Select does not accept empty-string item values — use a sentinel.
const EMPTY = '__empty__'
const toInternal = (v: string) => (v === '' ? EMPTY : v)
const fromInternal = (v: string) => (v === EMPTY ? '' : v)

export function Select({
    value,
    onChange,
    options,
    placeholder,
    icon,
    error,
    disabled,
    className,
    size = 'md',
    id,
    ...ariaProps
}: SelectProps) {
    const selected = options.find((o) => o.value === value)
    const paddingY = size === 'sm' ? 'py-2' : 'py-3'

    return (
        <SelectRoot
            value={toInternal(value)}
            onValueChange={(v) => onChange(fromInternal(v))}
            disabled={disabled}
        >
            <div className={cn('relative', className)}>
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                        {icon}
                    </span>
                )}
                <SelectTrigger
                    id={id}
                    aria-invalid={error || undefined}
                    {...ariaProps}
                    className={cn(
                        'flex w-full items-center justify-between h-auto rounded-2xl border-2 bg-white dark:bg-slate-900 px-4 text-left font-medium transition-all shadow-sm min-h-[44px] text-[16px] sm:text-base focus:outline-none',
                        paddingY,
                        icon && 'pl-10',
                        error
                            ? 'border-destructive focus:border-destructive'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary',
                        disabled && 'opacity-50 cursor-not-allowed',
                        selected
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-400 dark:text-slate-500'
                    )}
                >
                    <span className="truncate">
                        <SelectValue placeholder={placeholder} />
                    </span>
                </SelectTrigger>
            </div>
            <SelectContent className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 overflow-hidden">
                {options.map((opt) => (
                    <SelectItem
                        key={opt.value || EMPTY}
                        value={toInternal(opt.value)}
                        className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-300 rounded-none"
                    >
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </SelectRoot>
    )
}
