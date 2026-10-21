import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function PageShell({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                'flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-6 lg:pl-20 xl:pl-56',
                className
            )}
        >
            {children}
        </div>
    )
}

interface PageHeaderProps {
    title: string
    subtitle?: string
    icon: LucideIcon
    actions?: ReactNode
    children?: ReactNode
    className?: string
    contentClassName?: string
}

export function PageHeader({
    title,
    subtitle,
    icon: Icon,
    actions,
    children,
    className,
    contentClassName,
}: PageHeaderProps) {
    return (
        <div className="pt-safe">
            <div
                className={cn(
                    'sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 pb-5 pt-12 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95',
                    className
                )}
            >
                <div
                    className={cn('flex items-center gap-3', contentClassName)}
                >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Icon size={22} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    {actions}
                </div>
                {children}
            </div>
        </div>
    )
}

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'

export interface PageContainerProps {
    children: ReactNode
    /** Cap the inner content width. Defaults to 3xl to match the settings/fridges pages. */
    maxWidth?: MaxWidth
    /** Vertical spacing scale between children (Tailwind space-y-*). */
    spacing?: 0 | 4 | 6 | 8
    /** Drop horizontal padding when the page renders its own edge-to-edge content. */
    noPadding?: boolean
    className?: string
}

const MAX_WIDTH: Record<MaxWidth, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full',
}

const SPACING: Record<NonNullable<PageContainerProps['spacing']>, string> = {
    0: '',
    4: 'space-y-4',
    6: 'space-y-6',
    8: 'space-y-8',
}

export function PageContainer({
    children,
    maxWidth = '3xl',
    spacing = 8,
    noPadding = false,
    className,
}: PageContainerProps) {
    return (
        <div
            className={cn(
                'mx-auto w-full',
                MAX_WIDTH[maxWidth],
                SPACING[spacing],
                !noPadding && 'px-4 sm:px-6 lg:px-8 py-6',
                className
            )}
        >
            {children}
        </div>
    )
}
