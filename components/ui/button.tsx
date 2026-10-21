import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:grayscale select-none aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 dark:shadow-primary/10',
                destructive:
                    'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30',
                outline:
                    'border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900',
                secondary:
                    'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
                ghost: 'text-primary hover:bg-primary/10 dark:hover:bg-primary/20',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'min-h-[44px] px-6 py-3 text-base has-[>svg]:px-4',
                xs: 'h-7 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5',
                sm: 'min-h-[44px] px-4 py-2.5 text-sm has-[>svg]:px-3',
                lg: 'min-h-[48px] px-8 py-4 text-lg has-[>svg]:px-6',
                icon: 'size-11 rounded-2xl',
                'icon-xs': 'size-7 rounded-lg',
                'icon-sm': 'size-9 rounded-xl',
                'icon-lg': 'size-12 rounded-2xl',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? Slot.Root : 'button'

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
