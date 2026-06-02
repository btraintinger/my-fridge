'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Minus, Plus } from 'lucide-react'
import { cn } from './Button'

type Tone = 'default' | 'emerald'
type Size = 'sm' | 'md' | 'lg'

interface QuantityStepperProps {
    value: number
    onChange: (next: number) => void | Promise<void>
    min?: number
    max?: number
    disabled?: boolean
    size?: Size
    tone?: Tone
    className?: string
    inputAriaLabel?: string
    commitDelayMs?: number
}

const sizeStyles: Record<
    Size,
    { button: string; input: string; icon: number; container: string }
> = {
    sm: {
        button: 'h-8 w-8',
        input: 'h-8 w-12 text-sm',
        icon: 14,
        container: 'rounded-lg',
    },
    md: {
        button: 'h-10 w-10',
        input: 'h-10 w-16 text-base',
        icon: 18,
        container: 'rounded-xl',
    },
    lg: {
        button: 'h-12 w-12',
        input: 'h-12 w-20 text-lg',
        icon: 20,
        container: 'rounded-2xl',
    },
}

const toneStyles: Record<
    Tone,
    {
        container: string
        button: string
        inputBorder: string
        inputText: string
    }
> = {
    default: {
        container:
            'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
        button: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
        inputBorder: 'border-slate-200 dark:border-slate-800',
        inputText: 'text-slate-900 dark:text-slate-100',
    },
    emerald: {
        container:
            'border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 shadow-sm',
        button: 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50',
        inputBorder: 'border-emerald-200 dark:border-emerald-900/60',
        inputText: 'font-bold text-emerald-900 dark:text-emerald-100',
    },
}

export function QuantityStepper({
    value,
    onChange,
    min = 1,
    max = 999,
    disabled = false,
    size = 'md',
    tone = 'default',
    className,
    inputAriaLabel,
    commitDelayMs = 400,
}: QuantityStepperProps) {
    const t = useTranslations('common')
    const sizes = sizeStyles[size]
    const tones = toneStyles[tone]

    const [display, setDisplay] = useState<number>(value)
    const [draft, setDraft] = useState<string>(String(value))
    const focusedRef = useRef(false)
    const pendingRef = useRef<number | null>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onChangeRef = useRef(onChange)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        if (pendingRef.current !== null) return
        setDisplay(value)
        if (!focusedRef.current) setDraft(String(value))
    }, [value])

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    const clamp = useCallback(
        (n: number) => {
            if (Number.isNaN(n)) return display
            let next = Math.floor(n)
            if (next < min) next = min
            if (typeof max === 'number' && next > max) next = max
            return next
        },
        [display, min, max]
    )

    const scheduleCommit = useCallback(
        (next: number) => {
            pendingRef.current = next
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                const target = pendingRef.current
                pendingRef.current = null
                timerRef.current = null
                if (target !== null && target !== value) {
                    void onChangeRef.current(target)
                }
            }, commitDelayMs)
        },
        [commitDelayMs, value]
    )

    const flushCommit = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        const target = pendingRef.current
        pendingRef.current = null
        if (target !== null && target !== value) {
            void onChangeRef.current(target)
        }
    }, [value])

    const step = (delta: number) => {
        const next = clamp(display + delta)
        if (next === display) return
        setDisplay(next)
        if (!focusedRef.current) setDraft(String(next))
        scheduleCommit(next)
    }

    const commitDraft = (raw: string) => {
        const parsed = parseInt(raw, 10)
        const next = clamp(parsed)
        setDisplay(next)
        setDraft(String(next))
        scheduleCommit(next)
    }

    const atMin = display <= min
    const atMax = typeof max === 'number' && display >= max

    return (
        <div
            className={cn(
                'inline-flex items-center overflow-hidden',
                sizes.container,
                tones.container,
                className
            )}
        >
            <button
                type="button"
                aria-label={t('decrease')}
                onClick={() => step(-1)}
                disabled={disabled || atMin}
                className={cn(
                    'flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                    sizes.button,
                    tones.button
                )}
            >
                <Minus size={sizes.icon} />
            </button>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={inputAriaLabel}
                value={draft}
                onFocus={(e) => {
                    focusedRef.current = true
                    e.currentTarget.select()
                }}
                onChange={(e) => {
                    const sanitized = e.target.value
                        .replace(/[^0-9]/g, '')
                        .slice(0, 3)
                    setDraft(sanitized)
                }}
                onBlur={(e) => {
                    focusedRef.current = false
                    commitDraft(e.target.value)
                    flushCommit()
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        ;(e.target as HTMLInputElement).blur()
                    } else if (e.key === 'Escape') {
                        setDraft(String(display))
                        ;(e.target as HTMLInputElement).blur()
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        step(1)
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        step(-1)
                    }
                }}
                disabled={disabled}
                className={cn(
                    'border-x px-0 py-0 leading-none text-center tabular-nums bg-transparent focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
                    sizes.input,
                    tones.inputBorder,
                    tones.inputText
                )}
            />
            <button
                type="button"
                aria-label={t('increase')}
                onClick={() => step(1)}
                disabled={disabled || atMax}
                className={cn(
                    'flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                    sizes.button,
                    tones.button
                )}
            >
                <Plus size={sizes.icon} />
            </button>
        </div>
    )
}
