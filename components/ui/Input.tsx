import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from './Button'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    'flex w-full rounded-2xl border-2 bg-white dark:bg-slate-900 px-4 py-3 text-base font-medium text-slate-900 dark:text-slate-100 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
                    error
                        ? 'border-red-500 focus-visible:border-red-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-500',
                    className
                )}
                {...props}
            />
        )
    }
)

Input.displayName = 'Input'
