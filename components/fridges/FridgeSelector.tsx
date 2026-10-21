'use client'

import { Select, type SelectProps } from '@/components/forms/SelectField'
import type { Fridge } from '@/lib/types'

interface FridgeSelectorProps extends Omit<
    SelectProps,
    'value' | 'onChange' | 'options'
> {
    fridges: Fridge[]
    selectedFridge: string
    onSelect: (fridgeId: string) => void
}

export function FridgeSelector({
    fridges,
    selectedFridge,
    onSelect,
    ...props
}: FridgeSelectorProps) {
    const options = fridges.flatMap((fridge) =>
        fridge.id ? [{ value: fridge.id, label: fridge.name }] : []
    )
    if (options.length === 0) return null
    return (
        <Select
            {...props}
            value={selectedFridge}
            onChange={onSelect}
            options={options}
        />
    )
}
