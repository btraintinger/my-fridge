'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChefHat, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import type { FridgeItem } from '@/lib/types'

interface ProductGridViewProps {
    groupedItems: Record<string, FridgeItem[]>
    sortedCategories: string[]
    onItemClick: (item: FridgeItem) => void
    onDeleteRequest: (item: FridgeItem) => void
}

export function ProductGridView({
    groupedItems,
    sortedCategories,
    onItemClick,
    onDeleteRequest,
}: ProductGridViewProps) {
    const t = useTranslations()

    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
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

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [cat]: !prev[cat],
        }))
    }


    const beginSwipe = (itemId: string, pointerId: number, clientX: number, clientY: number) => {
        swipeSessionRef.current = { itemId, pointerId, startX: clientX, startY: clientY, active: true }
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
                const itemToDel = groupedItems[category].find((i) => i.id === itemId)
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

    const handleItemPointerDown = (itemId: string, event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== 'touch') return
        event.currentTarget.setPointerCapture(event.pointerId)
        beginSwipe(itemId, event.pointerId, event.clientX, event.clientY)
    }

    const handleItemPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== 'touch') return
        if (swipeSessionRef.current?.pointerId !== event.pointerId) return
        updateSwipe(event.clientX, event.clientY)
    }

    const handleItemPointerUp = async (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== 'touch') return
        if (swipeSessionRef.current?.pointerId !== event.pointerId) return
        try {
            event.currentTarget.releasePointerCapture(event.pointerId)
        } catch { }
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

    return (
        <div className="space-y-8">
            {sortedCategories.map((category) => (
                <div key={category} className="space-y-3">
                    <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 border-b-4 border-slate-200 dark:border-slate-800 rounded-t-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-h-[48px]"
                    >
                        <div className="flex items-center gap-2">
                            {expandedCategories[category] ? (
                                <ChevronDown size={20} className="text-slate-400" />
                            ) : (
                                <ChevronRight size={20} className="text-slate-400" />
                            )}
                            <h4 className="font-bold text-slate-700 dark:text-slate-300">
                                {category}
                            </h4>
                            <span className="ml-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-0.5 px-2 rounded-full">
                                {groupedItems[category].length}
                            </span>
                        </div>
                    </button>

                    <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCategories[category] ? 'opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-4 px-1 sm:px-2 relative">
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 rounded-b-xl shadow-inner pointer-events-none -z-10" />

                            {groupedItems[category].map((item) => (
                                <div
                                    key={item.id}
                                    className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/60 transform transition-transform hover:-translate-y-1 hover:shadow-md group/item"
                                >
                                    <div className="hidden md:flex absolute top-2 right-2 z-10 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDeleteRequest(item)
                                            }}
                                            className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full shadow-sm backdrop-blur-sm border border-slate-200 dark:border-slate-700 transition-colors"
                                            title={t('fridges.detail.deleteProductTooltip')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div
                                        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center rounded-r-2xl bg-rose-500/95 text-white opacity-0 transition-opacity"
                                        aria-hidden="true"
                                        style={{ opacity: swipeItemId === item.id ? 1 : 0 }}
                                    >
                                        <div className="flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                                            <Trash2 size={16} />
                                            {t('fridges.detail.swipeDelete')}
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => handleItemClick(item)}
                                        onPointerDown={(event) => handleItemPointerDown(item.id!, event)}
                                        onPointerMove={handleItemPointerMove}
                                        onPointerUp={handleItemPointerUp}
                                        onPointerCancel={handleItemPointerUp}
                                        className={`group p-3 cursor-pointer active:scale-[0.98] flex items-center gap-3 ${swipeItemId === item.id ? 'touch-none' : ''}`}
                                        style={{
                                            transform: swipeItemId === item.id ? `translateX(${swipeOffset}px)` : undefined,
                                            transition: swipeItemId === item.id ? 'none' : 'transform 180ms ease',
                                            touchAction: 'pan-y',
                                            willChange: swipeItemId === item.id ? 'transform' : undefined,
                                            backgroundColor: 'var(--card)'
                                        }}
                                    >
                                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {item.product?.image_url ? (
                                                <Image
                                                    src={item.product.image_url}
                                                    alt={item.product.product_name}
                                                    width={56}
                                                    height={56}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-[9px] text-slate-300 dark:text-slate-600 p-1 text-center font-bold uppercase leading-tight">
                                                    <ChefHat size={16} className="mb-0.5" />
                                                    {t('productModal.noImage')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {item.product.product_name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {item.product.brands || '-'}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                            <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                                                {item.quantity ?? 1}x
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
