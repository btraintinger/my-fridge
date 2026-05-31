'use client'

import { Select } from '../ui/Select'
import type { Fridge } from '@/lib/types'

interface FridgeSelectorProps {
    fridges: Fridge[]
    selectedFridge: string
    onSelect: (fridgeId: string) => void
}

export function FridgeSelector({
    fridges,
    selectedFridge,
    onSelect,
}: FridgeSelectorProps) {
    if (fridges.length === 0) return null

    return (
        <Select
            value={selectedFridge}
            onChange={onSelect}
            options={fridges.map((f) => ({ value: f.id!, label: f.name }))}
        />
    )
}
