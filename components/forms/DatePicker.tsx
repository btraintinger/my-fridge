'use client'

import { Button } from '@/components/ui/button'
import * as React from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

export interface DatePickerProps extends React.AriaAttributes {
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

function isoToDate(iso: string): Date | undefined {
    if (!iso) return undefined
    const d = parseISO(iso)
    return isValid(d) ? d : undefined
}

function dateToIso(d: Date): string {
    return format(d, 'yyyy-MM-dd')
}

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
    ...ariaProps
}: DatePickerProps) {
    const tCommon = useTranslations('common')
    const locale = useLocale()
    const dateFnsLocale = locale === 'de' ? de : enUS

    const selected = isoToDate(value)
    const minDate = min ? isoToDate(min) : undefined
    const today = React.useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])

    const [open, setOpen] = React.useState(false)

    function handleSelect(date: Date | undefined) {
        onChange(date ? dateToIso(date) : '')
        setOpen(false)
    }

    const displayLabel = selected
        ? format(selected, 'PP', { locale: dateFnsLocale })
        : (placeholder ?? tCommon('selectDate'))

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    id={id}
                    name={name}
                    type="button"
                    disabled={disabled}
                    aria-invalid={error || undefined}
                    {...ariaProps}
                    className={cn(
                        'flex w-full items-center justify-between rounded-2xl border-2 bg-white dark:bg-slate-900 px-4 py-3 text-left font-medium transition-all shadow-sm min-h-[44px] text-[16px] sm:text-base focus:outline-none active:scale-[0.98]',
                        error
                            ? 'border-destructive focus:border-destructive'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary',
                        disabled && 'opacity-50 cursor-not-allowed',
                        selected
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-400 dark:text-slate-500',
                        className
                    )}
                >
                    <span className="flex items-center gap-2 truncate">
                        <CalendarIcon
                            size={18}
                            className="text-slate-400 flex-shrink-0"
                        />
                        {displayLabel}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xl"
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    defaultMonth={selected ?? today}
                    locale={dateFnsLocale}
                    disabled={minDate ? (date) => date < minDate! : undefined}
                />
                <div className="flex justify-between gap-2 border-t px-3 py-2">
                    <Button
                        variant="ghost"
                        type="button"
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-lg transition-colors"
                        onClick={() => {
                            onChange('')
                            setOpen(false)
                        }}
                    >
                        {tCommon('delete')}
                    </Button>
                    <Button
                        variant="ghost"
                        type="button"
                        className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors"
                        onClick={() => {
                            if (minDate && today < minDate) return
                            onChange(dateToIso(today))
                            setOpen(false)
                        }}
                    >
                        {tCommon('today')}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
