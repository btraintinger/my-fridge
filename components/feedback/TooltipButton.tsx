'use client'

import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export function TooltipButton({
    tooltip,
    ...props
}: ComponentProps<typeof Button> & { tooltip: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button {...props} />
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    )
}
