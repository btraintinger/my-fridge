'use client'

import Image from 'next/image'
import { Package, Trash2 } from 'lucide-react'
import { DatePicker } from './DatePicker'
import { QuantityStepper } from './QuantityStepper'
import { NutriScoreBadge } from '../fridge-details/NutriScoreComponents'

export interface ProductRowItem {
    id: string
    imageUrl?: string
    name: string
    brand?: string
    nutriscoreGrade?: string
    quantity: number
    expiryDate?: string
    /** Small badge rendered under the name — category chip, status text, etc. */
    badge?: React.ReactNode
    /** Hides quantity stepper and date picker (e.g. while scanning) */
    controlsDisabled?: boolean
    /** Makes image + name tappable */
    onClick?: () => void
}

interface Props {
    items: ProductRowItem[]
    onQuantityChange: (id: string, qty: number) => void
    onExpiryDateChange: (id: string, date: string) => void
    onRemove: (id: string) => void
    /** Header label for the badge column in the desktop table */
    badgeColumnHeader?: string
}

function Thumb({
    imageUrl,
    name,
    size,
}: {
    imageUrl?: string
    name: string
    size: number
}) {
    if (imageUrl) {
        return (
            <Image
                src={imageUrl}
                alt={name}
                width={size}
                height={size}
                className="w-full h-full object-cover"
            />
        )
    }
    return <Package size={size * 0.4} className="text-slate-400" />
}

export function ProductItemList({
    items,
    onQuantityChange,
    onExpiryDateChange,
    onRemove,
    badgeColumnHeader,
}: Props) {
    const minDate = new Date().toISOString().split('T')[0]

    return (
        <>
            {/* ── Mobile cards ── */}
            <div className="sm:hidden space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center gap-3 px-3 pt-3 pb-2">
                            <div
                                className={`w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden ${item.onClick ? 'cursor-pointer' : ''}`}
                                onClick={item.onClick}
                            >
                                <Thumb
                                    imageUrl={item.imageUrl}
                                    name={item.name}
                                    size={44}
                                />
                            </div>
                            <div
                                className={`flex-1 min-w-0 ${item.onClick ? 'cursor-pointer' : ''}`}
                                onClick={item.onClick}
                            >
                                <div
                                    className="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate"
                                    title={item.name}
                                >
                                    {item.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    {item.brand && (
                                        <span className="text-xs text-slate-400 truncate">
                                            {item.brand}
                                        </span>
                                    )}
                                    {item.badge}
                                    <NutriScoreBadge
                                        grade={item.nutriscoreGrade}
                                        size="sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => onRemove(item.id)}
                                className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors flex-shrink-0"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        {!item.controlsDisabled && (
                            <div className="flex items-center gap-2 px-3 pb-3 border-t border-slate-100 dark:border-slate-800 pt-2">
                                <QuantityStepper
                                    value={item.quantity}
                                    onChange={(next) =>
                                        onQuantityChange(item.id, next)
                                    }
                                    size="sm"
                                />
                                <div className="flex-1">
                                    <DatePicker
                                        placeholder="Ablaufdatum"
                                        value={item.expiryDate || ''}
                                        onChange={(val) =>
                                            onExpiryDateChange(item.id, val)
                                        }
                                        min={minDate}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 w-16" />
                                <th className="px-4 py-3 font-semibold">
                                    Produkt
                                </th>
                                {badgeColumnHeader && (
                                    <th className="px-4 py-3 font-semibold">
                                        {badgeColumnHeader}
                                    </th>
                                )}
                                <th className="px-4 py-3 font-semibold w-28">
                                    Menge
                                </th>
                                <th className="px-4 py-3 font-semibold w-24 text-center">
                                    Nutri-Score
                                </th>
                                <th className="px-4 py-3 font-semibold w-44">
                                    Ablaufdatum
                                </th>
                                <th className="px-4 py-3 font-semibold text-right">
                                    Aktionen
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors align-middle"
                                >
                                    <td
                                        className={`px-4 py-2 align-middle ${item.onClick ? 'cursor-pointer' : ''}`}
                                        onClick={item.onClick}
                                    >
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                                            <Thumb
                                                imageUrl={item.imageUrl}
                                                name={item.name}
                                                size={40}
                                            />
                                        </div>
                                    </td>
                                    <td
                                        className={`px-4 py-2 align-middle font-medium text-slate-900 dark:text-slate-50 ${item.onClick ? 'cursor-pointer' : ''}`}
                                        onClick={item.onClick}
                                    >
                                        <div
                                            className="truncate max-w-[200px]"
                                            title={item.name}
                                        >
                                            {item.name}
                                        </div>
                                        {item.brand && (
                                            <div className="text-xs text-slate-400 font-normal truncate max-w-[200px]">
                                                {item.brand}
                                            </div>
                                        )}
                                    </td>
                                    {badgeColumnHeader && (
                                        <td className="px-4 py-2 align-middle">
                                            {item.badge}
                                        </td>
                                    )}
                                    <td className="px-4 py-2 align-middle">
                                        {!item.controlsDisabled && (
                                            <QuantityStepper
                                                value={item.quantity}
                                                onChange={(next) =>
                                                    onQuantityChange(
                                                        item.id,
                                                        next
                                                    )
                                                }
                                                size="sm"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-2 align-middle text-center">
                                        <div className="inline-flex">
                                            <NutriScoreBadge
                                                grade={item.nutriscoreGrade}
                                                size="sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 align-middle">
                                        {!item.controlsDisabled && (
                                            <DatePicker
                                                placeholder="Ablaufdatum"
                                                value={item.expiryDate || ''}
                                                onChange={(val) =>
                                                    onExpiryDateChange(
                                                        item.id,
                                                        val
                                                    )
                                                }
                                                min={minDate}
                                                className="min-w-[140px] text-xs"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-2 align-middle text-right">
                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors inline-flex"
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
