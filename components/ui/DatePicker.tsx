'use client'

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from './Button'

export interface DatePickerProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    error?: boolean
    disabled?: boolean
    className?: string
    min?: string
    id?: string
    name?: string
}

const POPOVER_WIDTH = 288 // 18rem
const POPOVER_HEIGHT = 340 // approx

function pad(n: number) {
    return String(n).padStart(2, '0')
}

function formatIso(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseIso(s: string): Date | null {
    if (!s) return null
    const [y, m, d] = s.split('-').map(Number)
    if (!y || !m || !d) return null
    const date = new Date(y, m - 1, d)
    date.setHours(0, 0, 0, 0)
    return date
}

function formatDisplay(d: Date) {
    return d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
]

export function DatePicker({
    value,
    onChange,
    placeholder,
    error,
    disabled,
    className,
    min,
    id,
    name,
}: DatePickerProps) {
    const tCommon = useTranslations('common')
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    const selected = parseIso(value)
    const minDate = useMemo(() => (min ? parseIso(min) : null), [min])
    const today = useMemo(() => {
        const t = new Date()
        t.setHours(0, 0, 0, 0)
        return t
    }, [])

    const [view, setView] = useState(() => {
        const base = selected ?? today
        return new Date(base.getFullYear(), base.getMonth(), 1)
    })

    const [position, setPosition] = useState<{
        top: number
        left: number
        placement: 'bottom' | 'top'
    } | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (open) {
            const base = selected ?? today
            setView(new Date(base.getFullYear(), base.getMonth(), 1))
        }
    }, [open])

    const measure = useCallback(() => {
        const trigger = triggerRef.current
        if (!trigger) return
        const rect = trigger.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const placement: 'bottom' | 'top' =
            spaceBelow < POPOVER_HEIGHT && rect.top > spaceBelow
                ? 'top'
                : 'bottom'
        const desiredLeft = rect.left
        const maxLeft = window.innerWidth - POPOVER_WIDTH - 8
        const left = Math.max(8, Math.min(desiredLeft, maxLeft))
        setPosition({
            top: placement === 'bottom' ? rect.bottom + 8 : rect.top - 8,
            left,
            placement,
        })
    }, [])

    useLayoutEffect(() => {
        if (!open) return
        measure()
        window.addEventListener('resize', measure)
        window.addEventListener('scroll', measure, true)
        return () => {
            window.removeEventListener('resize', measure)
            window.removeEventListener('scroll', measure, true)
        }
    }, [open, measure])

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            const target = e.target as Node
            if (
                triggerRef.current?.contains(target) ||
                popoverRef.current?.contains(target)
            ) {
                return
            }
            setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', handler)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    const days = useMemo(() => {
        const firstOfMonth = new Date(view.getFullYear(), view.getMonth(), 1)
        const startWeekday = (firstOfMonth.getDay() + 6) % 7
        const start = new Date(firstOfMonth)
        start.setDate(start.getDate() - startWeekday)
        const out: Date[] = []
        for (let i = 0; i < 42; i++) {
            const d = new Date(start)
            d.setDate(start.getDate() + i)
            out.push(d)
        }
        return out
    }, [view])

    function pick(d: Date) {
        if (minDate && d < minDate) return
        onChange(formatIso(d))
        setOpen(false)
    }

    const popover = open && position && (
        <div
            ref={popoverRef}
            role="dialog"
            style={{
                position: 'fixed',
                top: position.placement === 'bottom' ? position.top : undefined,
                bottom:
                    position.placement === 'top'
                        ? window.innerHeight - position.top
                        : undefined,
                left: position.left,
                width: POPOVER_WIDTH,
            }}
            className="z-[100] rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-3 animate-in fade-in slide-in-from-top-1 duration-150"
        >
            <div className="flex items-center justify-between mb-2">
                <button
                    type="button"
                    aria-label="Vorheriger Monat"
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    onClick={() =>
                        setView(
                            (v) =>
                                new Date(v.getFullYear(), v.getMonth() - 1, 1)
                        )
                    }
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {MONTHS[view.getMonth()]} {view.getFullYear()}
                </div>
                <button
                    type="button"
                    aria-label="Nächster Monat"
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    onClick={() =>
                        setView(
                            (v) =>
                                new Date(v.getFullYear(), v.getMonth() + 1, 1)
                        )
                    }
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d) => (
                    <div
                        key={d}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((d) => {
                    const inMonth = d.getMonth() === view.getMonth()
                    const isSelected = selected ? isSameDay(d, selected) : false
                    const isToday = isSameDay(d, today)
                    const dayDisabled = minDate ? d < minDate : false
                    return (
                        <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => pick(d)}
                            disabled={dayDisabled}
                            className={cn(
                                'h-9 w-9 mx-auto rounded-full text-sm font-medium transition-colors',
                                !inMonth &&
                                    'text-slate-300 dark:text-slate-600',
                                inMonth &&
                                    !isSelected &&
                                    'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
                                isSelected &&
                                    'bg-emerald-500 text-white hover:bg-emerald-600',
                                isToday &&
                                    !isSelected &&
                                    'ring-2 ring-emerald-500/40',
                                dayDisabled &&
                                    'opacity-30 cursor-not-allowed pointer-events-none'
                            )}
                        >
                            {d.getDate()}
                        </button>
                    )
                })}
            </div>
            <div className="mt-3 flex justify-between gap-2">
                <button
                    type="button"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-lg"
                    onClick={() => {
                        onChange('')
                        setOpen(false)
                    }}
                >
                    {tCommon('delete')}
                </button>
                <button
                    type="button"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-3 py-1 rounded-lg"
                    onClick={() => {
                        if (minDate && today < minDate) return
                        onChange(formatIso(today))
                        setOpen(false)
                    }}
                >
                    {tCommon('today')}
                </button>
            </div>
        </div>
    )

    return (
        <div className={cn('relative', className)}>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen((o) => !o)}
                id={id}
                name={name}
                className={cn(
                    'flex w-full items-center justify-between rounded-2xl border-2 bg-white dark:bg-slate-900 px-4 py-3 text-left font-medium transition-all shadow-sm min-h-[44px] text-[16px] sm:text-base focus:outline-none',
                    error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500',
                    disabled && 'opacity-50 cursor-not-allowed',
                    selected
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-400 dark:text-slate-500'
                )}
            >
                <span className="flex items-center gap-2 truncate">
                    <CalendarIcon
                        size={18}
                        className="text-slate-400 flex-shrink-0"
                    />
                    {selected
                        ? formatDisplay(selected)
                        : (placeholder ?? 'Datum wählen…')}
                </span>
            </button>
            {mounted && popover ? createPortal(popover, document.body) : null}
        </div>
    )
}
