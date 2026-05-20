'use client'

import {
    ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from './Button'

export interface SelectOption {
    value: string
    label: string
}

export interface SelectProps {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    icon?: ReactNode
    error?: boolean
    disabled?: boolean
    className?: string
    name?: string
    id?: string
    size?: 'sm' | 'md'
}

const POPOVER_MAX_HEIGHT = 288 // ~max-h-72

export function Select({
    value,
    onChange,
    options,
    placeholder,
    icon,
    error,
    disabled,
    className,
    name,
    id,
    size = 'md',
}: SelectProps) {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [mounted, setMounted] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const [position, setPosition] = useState<{
        top: number
        left: number
        width: number
        placement: 'bottom' | 'top'
    } | null>(null)

    const selected = options.find((o) => o.value === value)

    useEffect(() => {
        setMounted(true)
    }, [])

    const measure = useCallback(() => {
        const trigger = triggerRef.current
        if (!trigger) return
        const rect = trigger.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const placement: 'bottom' | 'top' =
            spaceBelow < POPOVER_MAX_HEIGHT && rect.top > spaceBelow ? 'top' : 'bottom'
        setPosition({
            top: placement === 'bottom' ? rect.bottom + 8 : rect.top - 8,
            left: rect.left,
            width: rect.width,
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
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    useEffect(() => {
        if (open) {
            const idx = options.findIndex((o) => o.value === value)
            setActiveIndex(idx >= 0 ? idx : 0)
        }
    }, [open, options, value])

    useEffect(() => {
        if (open && activeIndex >= 0) {
            const el = listRef.current?.children[activeIndex] as HTMLElement | undefined
            el?.scrollIntoView({ block: 'nearest' })
        }
    }, [activeIndex, open])

    function handleKeyDown(e: React.KeyboardEvent) {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!open) {
                setOpen(true)
            } else if (activeIndex >= 0 && activeIndex < options.length) {
                onChange(options[activeIndex].value)
                setOpen(false)
            }
        } else if (e.key === 'Escape') {
            if (open) {
                e.preventDefault()
                setOpen(false)
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!open) setOpen(true)
            else setActiveIndex((i) => Math.min(i + 1, options.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (!open) setOpen(true)
            else setActiveIndex((i) => Math.max(i - 1, 0))
        } else if (e.key === 'Home') {
            if (open) {
                e.preventDefault()
                setActiveIndex(0)
            }
        } else if (e.key === 'End') {
            if (open) {
                e.preventDefault()
                setActiveIndex(options.length - 1)
            }
        } else if (e.key === 'Tab') {
            if (open) setOpen(false)
        }
    }

    const paddingY = size === 'sm' ? 'py-2' : 'py-3'

    const popover = open && position && (
        <div
            ref={popoverRef}
            id={id ? `${id}-listbox` : undefined}
            role="listbox"
            style={{
                position: 'fixed',
                top: position.placement === 'bottom' ? position.top : undefined,
                bottom:
                    position.placement === 'top'
                        ? window.innerHeight - position.top
                        : undefined,
                left: position.left,
                width: position.width,
                maxHeight: POPOVER_MAX_HEIGHT,
            }}
            className="z-[100] rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 overflow-auto scrollbar-hide animate-in fade-in slide-in-from-top-1 duration-150"
        >
            <div ref={listRef}>
                {options.map((opt, i) => {
                    const isSelected = opt.value === value
                    const isActive = i === activeIndex
                    return (
                        <button
                            type="button"
                            role="option"
                            key={opt.value}
                            aria-selected={isSelected}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => {
                                onChange(opt.value)
                                setOpen(false)
                            }}
                            className={cn(
                                'flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-left transition-colors',
                                isActive
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            )}
                        >
                            <span className="truncate">{opt.label}</span>
                            {isSelected && (
                                <Check size={16} className="text-emerald-500 flex-shrink-0 ml-2" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )

    return (
        <div className={cn('relative', className)}>
            {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                    {icon}
                </span>
            )}
            <button
                ref={triggerRef}
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={id ? `${id}-listbox` : undefined}
                disabled={disabled}
                onClick={() => !disabled && setOpen((o) => !o)}
                onKeyDown={handleKeyDown}
                id={id}
                name={name}
                className={cn(
                    'flex w-full items-center justify-between rounded-2xl border-2 bg-white dark:bg-slate-900 px-4 text-left font-medium transition-all shadow-sm min-h-[44px] text-[16px] sm:text-base focus:outline-none',
                    paddingY,
                    icon && 'pl-10',
                    error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500',
                    disabled && 'opacity-50 cursor-not-allowed',
                    selected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
                )}
            >
                <span className="truncate">{selected?.label ?? placeholder ?? 'Auswählen…'}</span>
                <ChevronDown
                    size={18}
                    className={cn(
                        'text-slate-400 transition-transform flex-shrink-0 ml-2',
                        open && 'rotate-180'
                    )}
                />
            </button>
            {mounted && popover ? createPortal(popover, document.body) : null}
        </div>
    )
}
