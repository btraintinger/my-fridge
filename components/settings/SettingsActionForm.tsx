import { ReactNode } from 'react'
import { cn } from '@/components/ui/Button'

interface SettingsActionFormProps {
    title?: string
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void
    children: ReactNode
    danger?: boolean
    className?: string
}

export const SettingsActionForm = ({
    title,
    onSubmit,
    children,
    danger = false,
    className,
}: SettingsActionFormProps) => {
    return (
        <form
            onSubmit={onSubmit}
            className={cn(
                'space-y-4',
                danger && 'text-red-600 dark:text-red-400',
                className
            )}
        >
            {title && (
                <h3
                    className={cn(
                        'font-bold text-slate-900 dark:text-slate-50',
                        danger && 'text-red-600 dark:text-red-400'
                    )}
                >
                    {title}
                </h3>
            )}
            {children}
        </form>
    )
}

SettingsActionForm.displayName = 'SettingsActionForm'
