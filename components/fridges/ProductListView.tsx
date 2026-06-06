'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { FridgeItem } from '@/lib/types'
import { ProductItemList, type ProductRowItem } from '../ui/ProductItemList'

interface ProductListViewProps {
    items: FridgeItem[]
    onItemClick: (item: FridgeItem) => void
    onDeleteRequest: (item: FridgeItem) => void
    onQuantityChange: (itemId: string, quantity: number) => Promise<void>
    onExpiryDateChange: (itemId: string, date: string) => Promise<void>
}

export function ProductListView({
    items,
    onItemClick,
    onDeleteRequest,
    onQuantityChange,
    onExpiryDateChange,
}: ProductListViewProps) {
    const t = useTranslations()
    const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
        {}
    )

    const handleQuantityChange = async (itemId: string, qty: number) => {
        if (qty < 1) return
        setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
        try {
            await onQuantityChange(itemId, qty)
        } finally {
            setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
        }
    }

    const handleExpiryChange = async (itemId: string, date: string) => {
        setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
        try {
            await onExpiryDateChange(itemId, date)
        } finally {
            setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
        }
    }

    const rowItems: ProductRowItem[] = items.map((item) => ({
        id: item.id!,
        imageUrl: item.product?.image_url,
        name: item.product.product_name,
        brand: item.product.brands || undefined,
        nutriscoreGrade: item.product.nutriscore_grade ?? undefined,
        quantity: item.quantity ?? 1,
        expiryDate: item.expiryDate,
        badge: (
            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0">
                {item.product.category || t('fridges.detail.categories.other')}
            </span>
        ),
        controlsDisabled: updatingItems[item.id!],
        onClick: () => onItemClick(item),
    }))

    return (
        <ProductItemList
            items={rowItems}
            onQuantityChange={handleQuantityChange}
            onExpiryDateChange={handleExpiryChange}
            onRemove={(id) => {
                const item = items.find((i) => i.id === id)
                if (item) onDeleteRequest(item)
            }}
            badgeColumnHeader="Kategorie"
        />
    )
}
