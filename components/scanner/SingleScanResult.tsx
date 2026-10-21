import { Label } from '@/components/ui/label'
import { getProductLabel } from '@/lib/products/productCategories'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Check, Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FridgeSelector } from '@/components/fridges/FridgeSelector'
import { DatePicker } from '@/components/forms/DatePicker'
import { DietaryFlagBadge } from '@/components/products/DietaryFlagBadge'
import { AllergenWarning } from '@/components/products/AllergenWarning'
import { NutrientWarnings } from '@/components/products/NutrientWarnings'
import { NutritionFacts } from '@/components/products/NutritionFacts'
import { NutriScoreScale } from '@/components/products/NutriScore'
import type { Product, Fridge } from '@/lib/types'
import type { NutrimentWarning } from '@/lib/products/nutrimentWarnings'

export function SingleScanResult({
    product,
    expiryDate,
    onExpiryDateChange,
    fridges,
    selectedFridge,
    onFridgeChange,
    added,
    warnings,
    allergenLabels,
    onAddToFridge,
}: {
    product: Product
    expiryDate: string
    onExpiryDateChange: (v: string) => void
    fridges: Fridge[]
    selectedFridge: string
    onFridgeChange: (v: string) => void
    added: boolean
    warnings: NutrimentWarning[]
    allergenLabels: string
    onAddToFridge: () => void
}) {
    const t = useTranslations('scanner')
    const tManual = useTranslations('manualProduct')
    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            {/* Product header */}
            <div className="flex items-start gap-4">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.product_name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <Package size={32} />
                    </div>
                )}
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        {product.product_name}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {product.brands}
                    </p>
                    {product.origin_country && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                            {t('origin', { country: product.origin_country })}
                        </p>
                    )}
                    {product.nutriscore_grade && (
                        <div className="mt-3">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('nutriScore')}
                            </span>
                            <NutriScoreScale grade={product.nutriscore_grade} />
                        </div>
                    )}
                </div>
            </div>

            {/* Dietary flags */}
            <div className="flex flex-wrap gap-2">
                <DietaryFlagBadge
                    label={t('flags.vegan')}
                    value={product.dietary_flags?.vegan}
                />
                <DietaryFlagBadge
                    label={t('flags.vegetarian')}
                    value={product.dietary_flags?.vegetarian}
                />
                <DietaryFlagBadge
                    label={t('flags.palmOilFree')}
                    value={product.dietary_flags?.palm_oil_free}
                />
            </div>

            <AllergenWarning allergenLabels={allergenLabels} />
            <NutrientWarnings
                warnings={warnings}
                title={t('nutritionWarningsTitle')}
            />

            {/* Labels */}
            {Array.isArray(product.labels) && product.labels.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('labels')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {product.labels.slice(0, 6).map((label) => (
                            <span
                                key={label}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/50"
                            >
                                {getProductLabel(label, tManual('manualLabel'))}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Nutrition table */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                    {t('nutritionTitle')}
                </h3>
                <NutritionFacts nutriments={product.nutriments} layout="list" />
            </div>

            {/* Allergens raw */}
            {product.allergens && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/50">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                        {t('allergens')}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300/80">
                        {product.allergens}
                    </p>
                </div>
            )}

            {/* Add to fridge */}
            {!added ? (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {t('expiryLabel')}
                        </Label>
                        <DatePicker
                            value={expiryDate}
                            onChange={onExpiryDateChange}
                            placeholder={t('expiryPlaceholder')}
                            min={today}
                        />
                    </div>
                    {fridges.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {t('fridgeLabel')}
                            </Label>
                            <FridgeSelector
                                fridges={fridges}
                                selectedFridge={selectedFridge}
                                onSelect={onFridgeChange}
                            />
                        </div>
                    )}
                    <Button
                        className="w-full"
                        onClick={onAddToFridge}
                        disabled={fridges.length === 0}
                    >
                        <Plus size={20} className="mr-2" />
                        {t('addToFridge')}
                    </Button>
                    {fridges.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                            {t('createFridgeFirst')}
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-2xl font-semibold border border-emerald-100 dark:border-emerald-900/50">
                    <Check size={20} />
                    {t('addedToFridge')}
                </div>
            )}
        </div>
    )
}
