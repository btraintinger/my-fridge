import { useState } from 'react'
import { getSelectedFridgeId } from '@/lib/fridges/fridgeSelection'
import type { Fridge } from '@/lib/types'

export function useFridgeSelection(fridges: Fridge[]) {
    const [preferredId, setSelectedFridge] = useState('')
    return {
        selectedFridge: getSelectedFridgeId(fridges, preferredId),
        setSelectedFridge,
    }
}
