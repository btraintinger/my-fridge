'use client'

import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

import {
    getProductLabel,
    type ProductCategory,
} from '@/lib/products/productCategories'

import { AlertCircle, ChefHat, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { InventoryEditor } from '@/components/products/details/InventoryEditor'
import { CategoryEditor } from '@/components/products/details/CategoryEditor'
import { AllergenWarning } from '@/components/products/AllergenWarning'
import { NutrientWarnings } from '@/components/products/NutrientWarnings'
import { NutritionTable } from '@/components/products/details/NutritionTable'
import type { Product } from '@/lib/types'
import Image from 'next/image'
import { useProductWarnings } from '@/components/products/useProductWarnings'
import { DietaryFlagBadge } from '@/components/products/DietaryFlagBadge'

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
    onCategoryChange?: (
        itemId: string,
        fridgeId: string,
        category: ProductCategory
    ) => Promise<void>
    onClose: () => void
}

export function ProductDetailModal({
    product,
    quantity = 1,
    expiryDate = '',
    itemId,
    fridgeId,
    onQuantityChange,
    onExpiryDateChange,
    onCategoryChange,
    onDelete,
    onClose,
}: ProductDetailModalProps) {
    const t = useTranslations()
    const tManual = useTranslations('manualProduct')
    const { warnings, allergenLabels } = useProductWarnings(product)

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent
                aria-describedby={undefined}
                className="bottom-0 top-auto left-0 flex max-h-[90dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-3xl rounded-b-none bg-card p-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:max-w-lg"
            >
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
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-6">
                    <div>
                        <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight mb-1">
                            {product.product_name}
                        </DialogTitle>
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
                        <InventoryEditor
                            quantity={quantity}
                            expiryDate={expiryDate}
                            itemId={itemId}
                            fridgeId={fridgeId}
                            onQuantityChange={onQuantityChange}
                            onExpiryDateChange={onExpiryDateChange}
                        />
                    )}

                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                            {t('productModal.productInfo')}
                        </h3>
                        {onCategoryChange && itemId && fridgeId && (
                            <CategoryEditor
                                category={product.category}
                                onChange={(category) =>
                                    onCategoryChange(itemId, fridgeId, category)
                                }
                            />
                        )}
                        <div className="flex flex-wrap gap-2">
                            <DietaryFlagBadge
                                label={t('productModal.flags.vegan')}
                                value={product.dietary_flags?.vegan}
                            />
                            <DietaryFlagBadge
                                label={t('productModal.flags.vegetarian')}
                                value={product.dietary_flags?.vegetarian}
                            />
                            <DietaryFlagBadge
                                label={t('productModal.flags.palmOilFree')}
                                value={product.dietary_flags?.palm_oil_free}
                            />
                        </div>
                        {Array.isArray(product.labels) &&
                            product.labels.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {product.labels.slice(0, 8).map((label) => (
                                        <Badge
                                            variant="outline"
                                            key={label}
                                            className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300"
                                        >
                                            {getProductLabel(
                                                label,
                                                tManual('manualLabel')
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                    </div>

                    <AllergenWarning allergenLabels={allergenLabels} />

                    <NutrientWarnings warnings={warnings} />

                    <NutritionTable product={product} />

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
            </DialogContent>
        </Dialog>
    )
}
