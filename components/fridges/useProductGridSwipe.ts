import { useRef, useState } from 'react'
import type { FridgeItem } from '@/lib/types'

interface ProductGridSwipeOptions {
    groupedItems: Record<string, FridgeItem[]>
    sortedCategories: string[]
    onItemClick: (item: FridgeItem) => void
    onDeleteRequest: (item: FridgeItem) => void
}

export function useProductGridSwipe({
    groupedItems,
    sortedCategories,
    onItemClick,
    onDeleteRequest,
}: ProductGridSwipeOptions) {
    const [swipeItemId, setSwipeItemId] = useState<string | null>(null)
    const [swipeOffset, setSwipeOffset] = useState(0)
    const swipeOffsetRef = useRef(0)
    const swipeSessionRef = useRef<{
        itemId: string
        pointerId: number
        startX: number
        startY: number
        active: boolean
    } | null>(null)
    const suppressNextClickRef = useRef<string | null>(null)

    const beginSwipe = (
        itemId: string,
        pointerId: number,
        clientX: number,
        clientY: number
    ) => {
        swipeSessionRef.current = {
            itemId,
            pointerId,
            startX: clientX,
            startY: clientY,
            active: true,
        }
        setSwipeItemId(itemId)
        setSwipeOffset(0)
        swipeOffsetRef.current = 0
    }

    const updateSwipe = (clientX: number, clientY: number) => {
        const session = swipeSessionRef.current
        if (!session?.active) return

        const deltaX = clientX - session.startX
        const deltaY = clientY - session.startY

        if (Math.abs(deltaY) > 18 && Math.abs(deltaY) > Math.abs(deltaX)) {
            session.active = false
            setSwipeItemId(null)
            setSwipeOffset(0)
            swipeOffsetRef.current = 0
            return
        }

        if (deltaX < 0) {
            const nextOffset = Math.max(deltaX, -96)
            swipeOffsetRef.current = nextOffset
            setSwipeOffset(nextOffset)
        }
    }

    const endSwipe = async () => {
        const session = swipeSessionRef.current
        if (!session?.active) return

        const shouldDelete = swipeOffsetRef.current < -64
        const itemId = session.itemId

        swipeSessionRef.current = null
        setSwipeItemId(null)

        if (shouldDelete) {
            suppressNextClickRef.current = itemId
            // Find the item to delete
            for (const category of sortedCategories) {
                const itemToDel = groupedItems[category].find(
                    (i) => i.id === itemId
                )
                if (itemToDel) {
                    onDeleteRequest(itemToDel)
                    break
                }
            }
            swipeOffsetRef.current = 0
            setSwipeOffset(0)
        } else {
            swipeOffsetRef.current = 0
            setSwipeOffset(0)
        }
    }

    const handleItemPointerDown = (
        itemId: string,
        event: React.PointerEvent<HTMLButtonElement>
    ) => {
        if (event.pointerType !== 'touch') return
        event.currentTarget.setPointerCapture(event.pointerId)
        beginSwipe(itemId, event.pointerId, event.clientX, event.clientY)
    }

    const handleItemPointerMove = (
        event: React.PointerEvent<HTMLButtonElement>
    ) => {
        if (event.pointerType !== 'touch') return
        if (swipeSessionRef.current?.pointerId !== event.pointerId) return
        updateSwipe(event.clientX, event.clientY)
    }

    const handleItemPointerUp = async (
        event: React.PointerEvent<HTMLButtonElement>
    ) => {
        if (event.pointerType !== 'touch') return
        if (swipeSessionRef.current?.pointerId !== event.pointerId) return
        try {
            event.currentTarget.releasePointerCapture(event.pointerId)
        } catch {}
        await endSwipe()
    }

    const handleItemClick = (item: FridgeItem) => {
        if (suppressNextClickRef.current === item.id) {
            suppressNextClickRef.current = null
            return
        }
        if (swipeOffsetRef.current !== 0) return
        onItemClick(item)
    }

    return {
        swipeItemId,
        swipeOffset,
        handleItemClick,
        handleItemPointerDown,
        handleItemPointerMove,
        handleItemPointerUp,
    }
}
