'use client'

import { ReactNode, useEffect, useId } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/components/ui/Button'

interface SettingsActionModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    danger?: boolean
}

function SettingsActionModal({
    isOpen,
    onClose,
    title,
    children,
    danger = false,
}: SettingsActionModalProps) {
    const titleId = useId()
    const t = useTranslations('settings.modal')

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={cn(
                    'w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border overflow-hidden',
                    danger
                        ? 'border-red-100 dark:border-red-900/50'
                        : 'border-slate-100 dark:border-slate-800'
                )}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                    <div>
                        <h3
                            id={titleId}
                            className={cn(
                                'text-lg font-bold text-slate-900 dark:text-slate-50',
                                danger && 'text-red-600 dark:text-red-400'
                            )}
                        >
                            {title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={t('closeAria')}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}

export { SettingsActionModal }

export default SettingsActionModal
