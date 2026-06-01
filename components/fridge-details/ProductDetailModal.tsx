'use client'

import {
    AlertCircle,
    ChefHat,
    Info,
    Minus,
    Plus,
    Trash2,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '../ui/Button'
import { NutriScoreBadge } from './NutriScoreComponents'
import { DatePicker } from '../ui/DatePicker'
import type { Product } from '@/lib/types'
import { getNutrimentWarnings } from '@/lib/nutrimentWarnings'
import { notify } from '@/lib/notify'
import Image from 'next/image'

interface ProductDetailModalProps {
    product: Product
    quantity?: number
    expiryDate?: string
    itemId?: string
    fridgeId?: string
    onQuantityChange?: (
        itemId: string,
        fridgeId: string,
        quantity: number
    ) => Promise<void>
    onExpiryDateChange?: (
        itemId: string,
        fridgeId: string,
        expiryDate: string
    ) => Promise<void>
    onDelete?: (itemId: string, fridgeId: string) => Promise<void>
    onClose: () => void
}

function FlagBadge({
    label,
    value,
}: {
    label: string
    value: boolean | null | undefined
}) {
    const t = useTranslations('common')
    const text =
        value === true ? t('yes') : value === false ? t('no') : t('none')
    const tone =
        value === true
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40'
            : value === false
              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40'
              : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700'

    return (
        <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${tone}`}
        >
            {label}: {text}
        </span>
    )
}

export function ProductDetailModal({
    product,
    quantity = 1,
    expiryDate = '',
    itemId,
    fridgeId,
    onQuantityChange,
    onExpiryDateChange,
    onDelete,
    onClose,
}: ProductDetailModalProps) {
    const t = useTranslations()
    const warnings = getNutrimentWarnings(product)
    const [savingQuantity, setSavingQuantity] = useState(false)
    const [savingExpiryDate, setSavingExpiryDate] = useState(false)

    const commitQuantity = async (next: number) => {
        if (!itemId || !fridgeId || !onQuantityChange) return
        if (next < 1 || next === quantity) return
        setSavingQuantity(true)
        try {
            await onQuantityChange(itemId, fridgeId, next)
        } finally {
            setSavingQuantity(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full duration-300 border-x border-t sm:border border-white/10">
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.product_name}
                            fill
                            sizes="(max-width: 640px) 100vw, 512px"
                            className="w-full h-full object-contain p-4"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                            {t('productModal.noImage')}
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-sm rounded-full text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight mb-1">
                            {product.product_name}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {product.brands || '-'}
                        </p>
                        {product.origin_country && (
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {t('productModal.origin', {
                                    country: product.origin_country,
                                })}
                            </p>
                        )}
                    </div>

                    {typeof quantity === 'number' && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200/70 dark:border-emerald-900/50 space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                                    {t('productModal.inventory')}
                                </h3>
                                <div className="inline-flex items-center gap-0 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                    <button
                                        type="button"
                                        aria-label={t('common.decrease')}
                                        onClick={() =>
                                            commitQuantity(quantity - 1)
                                        }
                                        disabled={
                                            savingQuantity ||
                                            quantity <= 1 ||
                                            !onQuantityChange
                                        }
                                        className="h-10 w-10 flex items-center justify-center text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <div className="h-10 min-w-[3.5rem] px-3 flex items-center justify-center text-base font-bold text-emerald-900 dark:text-emerald-100 border-x border-emerald-200 dark:border-emerald-900/60 tabular-nums">
                                        {quantity}
                                    </div>
                                    <button
                                        type="button"
                                        aria-label={t('common.increase')}
                                        onClick={() =>
                                            commitQuantity(quantity + 1)
                                        }
                                        disabled={
                                            savingQuantity || !onQuantityChange
                                        }
                                        className="h-10 w-10 flex items-center justify-center text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {itemId && fridgeId && (
                                <div className="pt-4 border-t border-emerald-200/50 dark:border-emerald-900/50">
                                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                                        {t('productModal.expiryDateOptional')}
                                    </h3>
                                    <DatePicker
                                        value={expiryDate}
                                        onChange={async (val) => {
                                            if (!onExpiryDateChange) return
                                            setSavingExpiryDate(true)
                                            try {
                                                await onExpiryDateChange(
                                                    itemId,
                                                    fridgeId,
                                                    val
                                                )
                                            } catch {
                                                notify.error(
                                                    t(
                                                        'productModal.expiryDateUpdateError'
                                                    )
                                                )
                                            } finally {
                                                setSavingExpiryDate(false)
                                            }
                                        }}
                                        placeholder={t(
                                            'productModal.expiryDatePlaceholder'
                                        )}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        disabled={savingExpiryDate}
                                        className="w-full sm:w-64"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                            {t('productModal.productInfo')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <FlagBadge
                                label={t('productModal.flags.vegan')}
                                value={product.dietary_flags?.vegan}
                            />
                            <FlagBadge
                                label={t('productModal.flags.vegetarian')}
                                value={product.dietary_flags?.vegetarian}
                            />
                            <FlagBadge
                                label={t('productModal.flags.palmOilFree')}
                                value={product.dietary_flags?.palm_oil_free}
                            />
                        </div>
                        {Array.isArray(product.labels) &&
                            product.labels.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {product.labels.slice(0, 8).map((label) => (
                                        <span
                                            key={label}
                                            className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300"
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            )}
                    </div>

                    {warnings.length > 0 && (
                        <div className="space-y-2 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                                {t('productModal.nutritionWarnings')}
                            </h3>
                            <div className="space-y-2">
                                {warnings.map((warning) => (
                                    <p
                                        key={warning.id}
                                        className="text-sm text-amber-900 dark:text-amber-200"
                                    >
                                        <span className="font-semibold">
                                            {t(
                                                `nutrimentWarnings.${warning.id}.label` as never
                                            )}
                                            :
                                        </span>{' '}
                                        {warning.value.toFixed(1)}{' '}
                                        {warning.unit} -{' '}
                                        {t(
                                            `nutrimentWarnings.${warning.id}.${warning.severity}` as never
                                        )}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {product.nutriscore_grade && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    {t('productModal.nutriScore')}
                                </span>
                                <NutriScoreBadge
                                    grade={product.nutriscore_grade}
                                />
                            </div>
                        )}
                        {product.ecoscore_grade && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    {t('productModal.ecoScore')}
                                </span>
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base uppercase shadow-sm ${
                                        product.ecoscore_grade === 'a'
                                            ? 'bg-emerald-600'
                                            : product.ecoscore_grade === 'b'
                                              ? 'bg-emerald-500'
                                              : product.ecoscore_grade === 'c'
                                                ? 'bg-yellow-500'
                                                : product.ecoscore_grade === 'd'
                                                  ? 'bg-orange-500'
                                                  : 'bg-red-500'
                                    }`}
                                >
                                    {product.ecoscore_grade}
                                </div>
                            </div>
                        )}
                    </div>

                    {product.nutriments && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                <Info size={16} className="text-emerald-500" />
                                {t('productModal.nutritionTitle')}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {t('productModal.energy')}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.energy_kcal} kcal
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {t('productModal.fat')}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.fat}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {t('productModal.saturatedFat')}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.saturated_fat}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {t('productModal.sugars')}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.sugars}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {t('productModal.proteins')}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.proteins}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {t('productModal.fiber')}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.fiber}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {t('productModal.salt')}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.salt}g
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {product.allergens && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                <AlertCircle
                                    size={16}
                                    className="text-amber-500"
                                />
                                {t('productModal.allergens')}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/30 italic">
                                {product.allergens
                                    .split(',')
                                    .map((a) => a.replace('en:', ''))
                                    .join(', ') ||
                                    t('productModal.noAllergens')}
                            </p>
                        </div>
                    )}

                    {product.ingredients && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                <ChefHat
                                    size={16}
                                    className="text-emerald-500"
                                />
                                {t('productModal.ingredients')}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                {product.ingredients}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            onClick={onClose}
                            className="flex-1 h-12 rounded-2xl"
                            variant="outline"
                        >
                            {t('common.close')}
                        </Button>
                        {onDelete && itemId && fridgeId && (
                            <Button
                                onClick={() => onDelete(itemId, fridgeId)}
                                className="flex-1 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 border-rose-200 dark:border-rose-900/50"
                                variant="outline"
                            >
                                <Trash2 size={18} className="mr-2" />
                                {t('common.delete')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
