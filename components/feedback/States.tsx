import { type LucideIcon, AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    action?: ReactNode
    className?: string
    size?: 'default' | 'lg'
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    size = 'default',
}: EmptyStateProps) {
    return (
        <Empty
            className={cn(
                'flex flex-col items-center justify-center text-center py-12 px-6 gap-3',
                size === 'lg' && 'py-20 md:py-20',
                className
            )}
        >
            <EmptyHeader>
                {Icon ? (
                    <EmptyMedia
                        className={cn(
                            size === 'lg' &&
                                'size-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 shadow-inner mb-4'
                        )}
                    >
                        <Icon
                            className={cn(
                                'size-10 text-muted-foreground/60',
                                size === 'lg' && 'size-12 text-emerald-500'
                            )}
                            aria-hidden="true"
                        />
                    </EmptyMedia>
                ) : null}
                <EmptyTitle
                    className={cn(
                        'text-base font-semibold text-foreground',
                        size === 'lg' && 'text-2xl font-bold'
                    )}
                >
                    <h2>{title}</h2>
                </EmptyTitle>
                {description ? (
                    <EmptyDescription className="text-sm text-muted-foreground max-w-sm">
                        {description}
                    </EmptyDescription>
                ) : null}
            </EmptyHeader>
            {action ? (
                <EmptyContent className="mt-2">{action}</EmptyContent>
            ) : null}
        </Empty>
    )
}

export interface ErrorStateProps {
    icon?: LucideIcon
    title: string
    message?: string
    action?: ReactNode
    className?: string
}

export function ErrorState({
    icon: Icon = AlertTriangle,
    title,
    message,
    action,
    className,
}: ErrorStateProps) {
    return (
        <Alert
            variant="destructive"
            className={cn(
                'flex flex-col items-center justify-center text-center py-12 px-6 gap-3',
                className
            )}
        >
            <Icon className="w-10 h-10 text-error" aria-hidden="true" />
            <AlertTitle className="text-base font-semibold text-foreground">
                {title}
            </AlertTitle>
            {message ? (
                <AlertDescription className="text-sm text-muted-foreground max-w-sm">
                    {message}
                </AlertDescription>
            ) : null}
            {action ? <div className="mt-2">{action}</div> : null}
        </Alert>
    )
}
