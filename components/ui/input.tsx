import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'flex min-h-[44px] w-full min-w-0 rounded-2xl border-2 border-slate-200 bg-white dark:bg-slate-900 px-4 py-3 text-[16px] sm:text-base font-medium text-slate-900 dark:text-slate-100 shadow-sm transition-all outline-none',
                'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'hover:border-slate-300 dark:hover:border-slate-700',
                'focus-visible:border-primary focus-visible:ring-0',
                'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                'selection:bg-primary selection:text-primary-foreground',
                'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                className
            )}
            {...props}
        />
    )
}

export { Input }
