import type { Fridge } from '@/lib/types'

export function getSelectedFridgeId(
    fridges: Pick<Fridge, 'id'>[],
    preferredId: string
): string {
    return (
        fridges.find((fridge) => fridge.id && fridge.id === preferredId)?.id ??
        fridges.find((fridge) => fridge.id)?.id ??
        ''
    )
}
