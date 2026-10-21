'use client'

import { useId, type AriaAttributes, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

interface FormFieldControlProps extends AriaAttributes {
    id: string
}

interface FormFieldProps {
    label: string
    required?: boolean
    error?: string
    children: (props: FormFieldControlProps) => ReactNode
}

export function FormField({
    label,
    required,
    error,
    children,
}: FormFieldProps) {
    const id = useId()
    const errorId = `${id}-error`

    return (
        <Field data-invalid={!!error} className="gap-2">
            <FieldLabel
                htmlFor={id}
                className="gap-0 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider"
            >
                {label}
                {required && (
                    <span aria-hidden="true" className="text-rose-500 ml-0.5">
                        *
                    </span>
                )}
            </FieldLabel>
            {children({
                id,
                'aria-invalid': !!error,
                'aria-describedby': error ? errorId : undefined,
                'aria-required': required || undefined,
            })}
            {error && (
                <FieldError
                    id={errorId}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 ml-1 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                    <AlertCircle
                        size={14}
                        aria-hidden="true"
                        className="flex-shrink-0"
                    />
                    {error}
                </FieldError>
            )}
        </Field>
    )
}
