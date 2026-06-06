'use client'

import { useState } from 'react'
import { AlertCircle, Check, Plus } from 'lucide-react'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { ProductItemList, type ProductRowItem } from './ui/ProductItemList'
import { useTranslations } from 'next-intl'
import type { ScannedItem } from '@/hooks/useMultiScan'
import { useFridges } from '@/hooks/useFridges'

interface Props {
    items: ScannedItem[]
    onUpdateQuantity: (barcode: string, quantity: number) => void
    onUpdateExpiryDate: (barcode: string, expiryDate: string) => void
    onRemove: (barcode: string) => void
    onAddAll: (fridgeId: string) => void
    isAdding: boolean
    onAddManual: () => void
    onCancel: () => void
}

function StatusBadge({
    status,
    error,
}: {
    status: ScannedItem['status']
    error?: string
}) {
    const t = useTranslations('scanner')
    const tCommon = useTranslations('common')
    if (status === 'scanning') {
        return (
            <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" />
                {t('searching')}
            </span>
        )
    }
    if (status === 'error') {
        return (
            <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle size={11} />
                {error || tCommon('error')}
            </span>
        )
    }
    if (status === 'success') {
        return (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check size={12} />
                {t('recognized')}
            </span>
        )
    }
    return null
}

export function ScannedProductsList({
    items,
    onUpdateQuantity,
    onUpdateExpiryDate,
    onRemove,
    onAddAll,
    isAdding,
    onAddManual,
    onCancel,
}: Props) {
    const t = useTranslations('scanner')
    const tCommon = useTranslations('common')
    const { fridges } = useFridges()
    const [selectedFridge, setSelectedFridge] = useState(fridges[0]?.id || '')

    const rowItems: ProductRowItem[] = items.map((item) => ({
        id: item.barcode,
        imageUrl: item.product?.image_url,
        name: item.product?.product_name || item.barcode,
        brand: item.product?.brands || undefined,
        nutriscoreGrade: item.product?.nutriscore_grade ?? undefined,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        badge: <StatusBadge status={item.status} error={item.error} />,
        controlsDisabled: item.status !== 'success',
    }))

    return (
        <div className="space-y-6 pb-40 lg:pb-28">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    {t('multiScanReview')}
                </h2>
                <Button variant="outline" size="sm" onClick={onAddManual}>
                    <Plus size={16} className="mr-1" />
                    {t('addManually')}
                </Button>
            </div>

            {items.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                    {t('noProductsScanned')}
                </div>
            )}

            <ProductItemList
                items={rowItems}
                onQuantityChange={onUpdateQuantity}
                onExpiryDateChange={onUpdateExpiryDate}
                onRemove={onRemove}
                badgeColumnHeader={tCommon('status')}
            />

            {items.length > 0 && (
                <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-20 xl:left-56 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 z-30">
                    <div className="space-y-3">
                        <Select
                            value={selectedFridge}
                            onChange={setSelectedFridge}
                            options={fridges.map((f) => ({
                                value: f.id!,
                                label: f.name,
                            }))}
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="w-1/3"
                                onClick={onCancel}
                                disabled={isAdding}
                            >
                                {tCommon('cancel')}
                            </Button>
                            <Button
                                className="w-2/3"
                                onClick={() => onAddAll(selectedFridge)}
                                disabled={
                                    !selectedFridge ||
                                    isAdding ||
                                    items.every((i) => i.status !== 'success')
                                }
                            >
                                {isAdding ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        {t('addingAll')}
                                    </span>
                                ) : (
                                    t('addAll')
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
