'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    labels,
    ...props
}: CalendarProps) {
    const t = useTranslations('calendar')
    const locale = useLocale()
    const dateFnsLocale = { ...(locale === 'de' ? de : enUS), ...props.locale }
    const dateLabel = (date: Date) =>
        format(date, 'PPPP', { locale: dateFnsLocale })
    return (
        <DayPicker
            locale={dateFnsLocale}
            labels={{
                labelPrevious: () => t('previousMonth'),
                labelNext: () => t('nextMonth'),
                labelMonthDropdown: () => t('chooseMonth'),
                labelYearDropdown: () => t('chooseYear'),
                labelNav: () => t('navigation'),
                labelWeekNumber: (week) => t('weekNumber', { week }),
                labelWeekNumberHeader: () => t('weekNumberHeader'),
                labelDayButton: (date, modifiers) => {
                    let label = dateLabel(date)
                    if (modifiers.today) label = t('todayDate', { date: label })
                    if (modifiers.selected)
                        label = t('selectedDate', { date: label })
                    return label
                },
                labelGridcell: (date, modifiers) =>
                    modifiers?.today
                        ? t('todayDate', { date: dateLabel(date) })
                        : dateLabel(date),
                ...labels,
            }}
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col sm:flex-row gap-4',
                month: 'flex flex-col gap-4',
                month_caption: 'flex justify-center pt-1 relative items-center',
                caption_label:
                    'text-sm font-bold text-slate-700 dark:text-slate-200',
                nav: 'flex items-center gap-1',
                button_previous: cn(
                    buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                    'absolute left-1 h-8 w-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                ),
                button_next: cn(
                    buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                    'absolute right-1 h-8 w-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                ),
                month_grid: 'w-full border-collapse',
                weekdays: 'flex',
                weekday:
                    'text-[10px] font-bold uppercase tracking-wider text-slate-400 rounded-md w-9 text-center py-1',
                week: 'flex w-full mt-2',
                day: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day_button:
                    'flex h-9 w-9 min-h-0 min-w-0 items-center justify-center mx-auto rounded-full p-0 text-sm leading-none font-medium transition-colors text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 aria-selected:opacity-100 focus:outline-none',
                selected:
                    'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full',
                today: 'ring-2 ring-primary/40 rounded-full',
                outside: 'text-slate-300 dark:text-slate-600',
                disabled: 'opacity-30 cursor-not-allowed pointer-events-none',
                range_middle:
                    'aria-selected:bg-accent aria-selected:text-accent-foreground',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) =>
                    orientation === 'left' ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    ),
            }}
            {...props}
        />
    )
}
Calendar.displayName = 'Calendar'

export { Calendar }
