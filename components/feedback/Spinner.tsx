import { LoaderCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    tone?: 'brand' | 'inverse'
    className?: string
    label?: string
}

const SIZE = { sm: 'size-4', md: 'size-8', lg: 'size-12' }

export function Spinner({
    size = 'md',
    tone = 'brand',
    className,
    label,
}: SpinnerProps) {
    return (
        <LoaderCircleIcon
            data-slot="spinner"
            role="status"
            aria-label={label}
            className={cn(
                'animate-spin',
                SIZE[size],
                tone === 'inverse' ? 'text-white' : 'text-primary',
                className
            )}
        />
    )
}
