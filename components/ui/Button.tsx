import { ButtonHTMLAttributes, forwardRef } from 'react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-2xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:grayscale',
                    {
                        'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 dark:shadow-emerald-900/40':
                            variant === 'primary',
                        'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700':
                            variant === 'secondary',
                        'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900':
                            variant === 'outline',
                        'bg-transparent text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30':
                            variant === 'ghost',
                        'px-4 py-2 text-sm': size === 'sm',
                        'px-6 py-3 text-base': size === 'md',
                        'px-8 py-4 text-lg': size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'
