'use client'

import type { ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

interface SettingsCollapsibleCardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    icon: LucideIcon
    title: string
    summary: string
    children: ReactNode
}

export function SettingsCollapsibleCard({
    open,
    onOpenChange,
    icon: Icon,
    title,
    summary,
    children,
}: SettingsCollapsibleCardProps) {
    return (
        <Collapsible
            open={open}
            onOpenChange={onOpenChange}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    type="button"
                    aria-expanded={open}
                    className="flex h-auto w-full items-center gap-4 whitespace-normal p-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 dark:hover:bg-slate-800/40 sm:p-5"
                >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-50">
                            {title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {summary}
                        </p>
                    </div>
                    <ChevronDown
                        size={20}
                        className={cn(
                            'shrink-0 text-slate-400 transition-transform dark:text-slate-500',
                            open && 'rotate-180'
                        )}
                    />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>{children}</CollapsibleContent>
        </Collapsible>
    )
}

export function SettingsSwitchRow({
    label,
    checked,
    disabled,
    onCheckedChange,
}: {
    label: string
    checked: boolean
    disabled?: boolean
    onCheckedChange: (checked: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-800 sm:px-5">
            <span className="text-sm text-slate-700 dark:text-slate-300">
                {label}
            </span>
            <Switch
                size="sm"
                checked={checked}
                aria-label={label}
                disabled={disabled}
                onCheckedChange={onCheckedChange}
            />
        </div>
    )
}
