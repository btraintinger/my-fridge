'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChefHat, Trash2 } from 'lucide-react'
import type { FridgeItem } from '@/lib/types'
import { NutriScoreBadge } from '../fridge-details/NutriScoreComponents'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'

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

    // Keep track of which items are currently being updated to show a loading state
    const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
        {}
    )

    const handleQuantityChange = async (itemId: string, val: string) => {
        const num = parseInt(val, 10)
        if (isNaN(num) || num < 1) return
        setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
        try {
            await onQuantityChange(itemId, num)
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

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-16">
                                {t('productModal.productInfo')}
                            </th>
                            <th scope="col" className="px-4 py-3 font-semibold">
                                {t('fridges.detail.sort.nameAsc').split(' ')[0]}{' '}
                                {/* "Name" */}
                            </th>
                            <th scope="col" className="px-4 py-3 font-semibold">
                                Kategorie
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-3 font-semibold w-24"
                            >
                                {t('productModal.quantity', { count: 0 })
                                    .replace('0', '')
                                    .trim()}{' '}
                                {/* "Menge" */}
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-3 font-semibold w-24 text-center"
                            >
                                {t('productModal.nutriScore')}
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-3 font-semibold w-40"
                            >
                                Ablaufdatum
                            </th>
                            <th
                                scope="col"
                                className="px-4 py-3 font-semibold text-right"
                            >
                                Aktionen
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group"
                            >
                                <td
                                    className="px-4 py-2"
                                    onClick={() => onItemClick(item)}
                                >
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer">
                                        {item.product?.image_url ? (
                                            <Image
                                                src={item.product.image_url}
                                                alt={item.product.product_name}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ChefHat
                                                size={14}
                                                className="text-slate-400"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td
                                    className="px-4 py-2 font-medium text-slate-900 dark:text-slate-50 cursor-pointer"
                                    onClick={() => onItemClick(item)}
                                >
                                    <div
                                        className="truncate max-w-[200px]"
                                        title={item.product.product_name}
                                    >
                                        {item.product.product_name}
                                    </div>
                                    <div className="text-xs text-slate-400 font-normal truncate max-w-[200px]">
                                        {item.product.brands || '-'}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs">
                                        {item.product.category ||
                                            t(
                                                'fridges.detail.categories.other'
                                            )}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity ?? 1}
                                        onChange={(e) =>
                                            handleQuantityChange(
                                                item.id!,
                                                e.target.value
                                            )
                                        }
                                        disabled={updatingItems[item.id!]}
                                        className="w-20 h-8 text-center px-1"
                                    />
                                </td>
                                <td className="px-4 py-2 flex justify-center">
                                    <NutriScoreBadge
                                        grade={item.product.nutriscore_grade}
                                        size="sm"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <DatePicker
                                        value={item.expiryDate || ''}
                                        onChange={(val) =>
                                            handleExpiryChange(item.id!, val)
                                        }
                                        disabled={updatingItems[item.id!]}
                                        className="h-8 min-w-[140px] text-xs"
                                    />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onDeleteRequest(item)
                                        }}
                                        className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors inline-flex"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
