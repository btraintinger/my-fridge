'use client'

import { AlertCircle, ChefHat, Info, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { NutriScoreBadge } from './NutriScoreComponents'
import type { Product } from '../../lib/types'
import { getNutrimentWarnings } from '../../lib/nutrimentWarnings'
import Image from 'next/image'

interface ProductDetailModalProps {
    product: Product
    quantity?: number
    itemId?: string
    fridgeId?: string
    onQuantityChange?: (itemId: string, fridgeId: string, quantity: number) => Promise<void>
    onClose: () => void
}

function FlagBadge({
    label,
    value,
}: {
    label: string
    value: boolean | null | undefined
}) {
    const text = value === true ? 'Yes' : value === false ? 'No' : '-'
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
    itemId,
    fridgeId,
    onQuantityChange,
    onClose,
}: ProductDetailModalProps) {
    const warnings = getNutrimentWarnings(product)
    const [editingQuantity, setEditingQuantity] = useState(false)
    const [quantityDraft, setQuantityDraft] = useState(String(quantity))
    const [savingQuantity, setSavingQuantity] = useState(false)

    const saveQuantity = async () => {
        const parsed = Number.parseInt(quantityDraft, 10)
        if (!Number.isFinite(parsed) || parsed < 1 || !itemId || !fridgeId) return

        setSavingQuantity(true)
        try {
            await onQuantityChange?.(itemId, fridgeId, parsed)
            setEditingQuantity(false)
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
                            No image available
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
                                Origin: {product.origin_country}
                            </p>
                        )}
                    </div>

                    {typeof quantity === 'number' && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200/70 dark:border-emerald-900/50">
                            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                                Inventory
                            </h3>
                            {editingQuantity ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={quantityDraft}
                                        onChange={(e) => setQuantityDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                saveQuantity()
                                            }
                                        }}
                                        className="h-8 w-24 text-sm"
                                    />
                                    <Button
                                        size="sm"
                                        className="h-8 px-3 text-xs"
                                        disabled={savingQuantity}
                                        onClick={saveQuantity}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 px-3 text-xs"
                                        onClick={() => setEditingQuantity(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <button
                                    className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-950/70 transition-colors"
                                    onClick={() => setEditingQuantity(true)}
                                >
                                    Quantity: {quantity}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                            Product Info
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <FlagBadge
                                label="Vegan"
                                value={product.dietary_flags?.vegan}
                            />
                            <FlagBadge
                                label="Vegetarian"
                                value={product.dietary_flags?.vegetarian}
                            />
                            <FlagBadge
                                label="Palm oil free"
                                value={product.dietary_flags?.palm_oil_free}
                            />
                        </div>
                        {Array.isArray(product.labels) && product.labels.length > 0 && (
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
                                Nutrition warnings (per 100g)
                            </h3>
                            <div className="space-y-2">
                                {warnings.map((warning) => (
                                    <p
                                        key={warning.id}
                                        className="text-sm text-amber-900 dark:text-amber-200"
                                    >
                                        <span className="font-semibold">
                                            {warning.label}:
                                        </span>{' '}
                                        {warning.value.toFixed(1)} {warning.unit}{' '}
                                        - {warning.message}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {product.nutriscore_grade && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    Nutri-Score
                                </span>
                                <NutriScoreBadge
                                    grade={product.nutriscore_grade}
                                />
                            </div>
                        )}
                        {product.ecoscore_grade && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    Eco-Score
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
                                Nutritional Values (per 100g)
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Energy
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.energy_kcal} kcal
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Fat
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.fat}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Saturated Fat
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.saturated_fat}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Sugars
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.sugars}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Proteins
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.proteins}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Fiber
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-slate-50">
                                        {product.nutriments.fiber}g
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Salt
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
                                Allergens
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/30 italic">
                                {product.allergens
                                    .split(',')
                                    .map((a) => a.replace('en:', ''))
                                    .join(', ') || 'None reported'}
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
                                Ingredients
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                {product.ingredients}
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={onClose}
                        className="w-full h-12 rounded-2xl"
                        variant="outline"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    )
}
