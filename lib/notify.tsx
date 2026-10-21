'use client'

import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type messages from '@/messages/en.json'

type ToastType = 'success' | 'error' | 'info' | 'warning'
export type ToastMessage =
    | string
    | {
          key: `toast.${keyof typeof messages.toast}`
          values?: Record<string, string | number>
      }

function ToastText({ message }: { message: ToastMessage | Error }) {
    const t = useTranslations()
    return message instanceof Error
        ? t('toast.genericError')
        : typeof message === 'string'
          ? message
          : t(message.key, message.values)
}

function show(
    type: ToastType,
    message: ToastMessage | Error,
    duration?: number
) {
    return toast[type](<ToastText message={message} />, {
        duration: duration ?? (type === 'error' ? 5000 : 3000),
    })
}

export const notify = {
    success: (message: ToastMessage, duration?: number) =>
        show('success', message, duration),
    error: (err: string | Error, duration?: number) => {
        if (err instanceof Error) {
            console.error('Notify error:', err)
        }
        return show('error', err, duration)
    },
    info: (message: string, duration?: number) =>
        show('info', message, duration),
    warning: (message: string, duration?: number) =>
        show('warning', message, duration),
    dismiss: (id?: string | number) => toast.dismiss(id),
}
