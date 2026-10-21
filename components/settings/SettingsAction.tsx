'use client'

import { useId, ReactNode } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface SettingsActionModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    danger?: boolean
    description?: string
}

function SettingsActionModal({
    isOpen,
    onClose,
    title,
    children,
    danger = false,
    description,
}: SettingsActionModalProps) {
    const descriptionId = useId()
    if (danger) {
        return (
            <AlertDialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) onClose()
                }}
            >
                <AlertDialogContent
                    aria-describedby={description ? descriptionId : undefined}
                    className="gap-0 overflow-hidden rounded-3xl bg-card p-0 border-red-100 dark:border-red-900/50"
                >
                    <AlertDialogHeader className="border-b px-6 py-4 text-left sm:place-items-start">
                        <AlertDialogTitle className="text-lg font-bold text-red-600 dark:text-red-400">
                            {title}
                        </AlertDialogTitle>
                        {description && (
                            <AlertDialogDescription id={descriptionId}>
                                {description}
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>
                    <div className="p-6">{children}</div>
                </AlertDialogContent>
            </AlertDialog>
        )
    }
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent
                aria-describedby={undefined}
                className="gap-0 overflow-hidden rounded-3xl bg-card p-0"
            >
                <DialogHeader className="border-b px-6 py-4 pr-14">
                    <DialogTitle className="text-lg font-bold">
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">{children}</div>
            </DialogContent>
        </Dialog>
    )
}

export { SettingsActionModal }
export default SettingsActionModal

interface SettingsActionFormProps {
    title?: string
    onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void
    children: ReactNode
    danger?: boolean
    className?: string
    noValidate?: boolean
}

export const SettingsActionForm = ({
    title,
    onSubmit,
    children,
    danger = false,
    className,
    noValidate,
}: SettingsActionFormProps) => {
    return (
        <form
            onSubmit={onSubmit}
            noValidate={noValidate}
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
