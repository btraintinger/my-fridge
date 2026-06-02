'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ChefHat, Trash2 } from 'lucide-react'
import type { FridgeItem } from '@/lib/types'
import { NutriScoreBadge } from '../fridge-details/NutriScoreComponents'
import { DatePicker } from '../ui/DatePicker'
import { QuantityStepper } from '../ui/QuantityStepper'

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

    const handleQuantityChange = async (itemId: string, num: number) => {
        if (num < 1) return
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
        <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center gap-3 px-3 pt-3 pb-2">
                            <div
                                className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
                                onClick={() => onItemClick(item)}
                            >
                                {item.product?.image_url ? (
                                    <Image
                                        src={item.product.image_url}
                                        alt={item.product.product_name}
                                        width={44}
                                        height={44}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ChefHat
                                        size={16}
                                        className="text-slate-400"
                                    />
                                )}
                            </div>
                            <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => onItemClick(item)}
                            >
                                <div
                                    className="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate"
                                    title={item.product.product_name}
                                >
                                    {item.product.product_name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-400 truncate">
                                        {item.product.brands || '-'}
                                    </span>
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0">
                                        {item.product.category ||
                                            t(
                                                'fridges.detail.categories.other'
                                            )}
                                    </span>
                                    <NutriScoreBadge
                                        grade={item.product.nutriscore_grade}
                                        size="sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteRequest(item)
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors flex-shrink-0"
                                title={t('common.delete')}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 px-3 pb-3 border-t border-slate-100 dark:border-slate-800 pt-2">
                            <QuantityStepper
                                value={item.quantity ?? 1}
                                onChange={(next) =>
                                    handleQuantityChange(item.id!, next)
                                }
                                size="sm"
                            />
                            <div className="flex-1">
                                <DatePicker
                                    value={item.expiryDate || ''}
                                    onChange={(val) =>
                                        handleExpiryChange(item.id!, val)
                                    }
                                    disabled={updatingItems[item.id!]}
                                    className="text-xs"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-16">
                                    {t('productModal.productInfo')}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-semibold"
                                >
                                    {t('fridges.detail.sort.nameAsc').split(
                                        ' '
                                    )[0]}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-semibold"
                                >
                                    Kategorie
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-semibold w-24"
                                >
                                    {t('productModal.quantity', { count: 0 })
                                        .replace('0', '')
                                        .trim()}
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
                                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group align-middle"
                                >
                                    <td
                                        className="px-4 py-2 align-middle"
                                        onClick={() => onItemClick(item)}
                                    >
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer">
                                            {item.product?.image_url ? (
                                                <Image
                                                    src={item.product.image_url}
                                                    alt={
                                                        item.product
                                                            .product_name
                                                    }
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
                                        className="px-4 py-2 align-middle font-medium text-slate-900 dark:text-slate-50 cursor-pointer"
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
                                    <td className="px-4 py-2 align-middle text-slate-600 dark:text-slate-300">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs">
                                            {item.product.category ||
                                                t(
                                                    'fridges.detail.categories.other'
                                                )}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 align-middle">
                                        <QuantityStepper
                                            value={item.quantity ?? 1}
                                            onChange={(next) =>
                                                handleQuantityChange(
                                                    item.id!,
                                                    next
                                                )
                                            }
                                            size="sm"
                                        />
                                    </td>
                                    <td className="px-4 py-2 align-middle text-center">
                                        <div className="inline-flex">
                                            <NutriScoreBadge
                                                grade={
                                                    item.product.nutriscore_grade
                                                }
                                                size="sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 align-middle">
                                        <DatePicker
                                            value={item.expiryDate || ''}
                                            onChange={(val) =>
                                                handleExpiryChange(
                                                    item.id!,
                                                    val
                                                )
                                            }
                                            disabled={updatingItems[item.id!]}
                                            className="min-w-[140px] text-xs"
                                        />
                                    </td>
                                    <td className="px-4 py-2 align-middle text-right">
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
        </>
    )
}
