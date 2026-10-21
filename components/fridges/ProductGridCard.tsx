'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChefHat, Trash2 } from 'lucide-react'
import { TooltipButton } from '@/components/feedback/TooltipButton'
import { Button } from '@/components/ui/button'
import type { FridgeItem } from '@/lib/types'
import type { useProductGridSwipe } from '@/components/fridges/useProductGridSwipe'

interface ProductGridCardProps {
    item: FridgeItem
    onDeleteRequest: (item: FridgeItem) => void
    swipe: ReturnType<typeof useProductGridSwipe>
}

export function ProductGridCard({
    item,
    onDeleteRequest,
    swipe,
}: ProductGridCardProps) {
    const t = useTranslations()
    const {
        swipeItemId,
        swipeOffset,
        handleItemClick,
        handleItemPointerDown,
        handleItemPointerMove,
        handleItemPointerUp,
    } = swipe

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/60 transform transition-transform hover:-translate-y-1 hover:shadow-md group/item">
            <div className="hidden md:flex absolute top-1/2 right-2 -translate-y-1/2 z-10 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity">
                <TooltipButton
                    aria-label={t('fridges.detail.deleteProductTooltip')}
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onDeleteRequest(item)
                    }}
                    className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full shadow-sm backdrop-blur-sm border border-slate-200 dark:border-slate-700 transition-colors"
                    tooltip={t('fridges.detail.deleteProductTooltip')}
                >
                    <Trash2 size={16} />
                </TooltipButton>
            </div>

            <div
                className="absolute inset-y-0 right-0 w-20 flex items-center justify-center rounded-r-2xl bg-rose-500/95 text-white opacity-0 transition-opacity"
                aria-hidden="true"
                style={{
                    opacity: swipeItemId === item.id ? 1 : 0,
                }}
            >
                <div className="flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                    <Trash2 size={16} />
                    {t('fridges.detail.swipeDelete')}
                </div>
            </div>
            <Button
                variant="ghost"
                type="button"
                onClick={() => handleItemClick(item)}
                onPointerDown={(event) =>
                    handleItemPointerDown(item.id!, event)
                }
                onPointerMove={handleItemPointerMove}
                onPointerUp={handleItemPointerUp}
                onPointerCancel={handleItemPointerUp}
                className={`group h-auto w-full justify-start rounded-none p-3 md:pr-16 text-left whitespace-normal cursor-pointer active:scale-[0.98] flex items-center gap-3 ${swipeItemId === item.id ? 'touch-none' : ''}`}
                style={{
                    transform:
                        swipeItemId === item.id
                            ? `translateX(${swipeOffset}px)`
                            : undefined,
                    transition:
                        swipeItemId === item.id
                            ? 'none'
                            : 'transform 180ms ease',
                    touchAction: 'pan-y',
                    willChange:
                        swipeItemId === item.id ? 'transform' : undefined,
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
            </Button>
        </div>
    )
}
