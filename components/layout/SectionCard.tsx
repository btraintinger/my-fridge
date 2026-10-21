import type { ReactNode } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SectionCardProps {
    title?: ReactNode
    subtitle?: string
    action?: ReactNode
    children: ReactNode
    /** Drop the default content padding when the body manages its own spacing. */
    noPadding?: boolean
    className?: string
}

/**
 * Project-level wrapper around shadcn `Card`. Replaces the repeated
 * `bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800`
 * pattern with a single source so card tone changes apply everywhere.
 */
export function SectionCard({
    title,
    subtitle,
    action,
    children,
    noPadding,
    className,
}: SectionCardProps) {
    return (
        <Card
            className={cn(
                'gap-4 rounded-2xl border-border bg-card shadow-sm',
                className
            )}
        >
            {(title || subtitle || action) && (
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                        {title ? (
                            <CardTitle className="text-base font-semibold text-foreground">
                                {title}
                            </CardTitle>
                        ) : null}
                        {subtitle ? (
                            <CardDescription>{subtitle}</CardDescription>
                        ) : null}
                    </div>
                    {action}
                </CardHeader>
            )}
            <CardContent className={cn(noPadding && 'px-0')}>
                {children}
            </CardContent>
        </Card>
    )
}
