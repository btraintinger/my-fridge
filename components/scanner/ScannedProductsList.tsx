'use client'

import { Spinner } from '@/components/feedback/Spinner'
import { EmptyState } from '@/components/feedback/States'
import { AlertCircle, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FridgeSelector } from '@/components/fridges/FridgeSelector'
import { useFridgeSelection } from '@/components/fridges/useFridgeSelection'
import {
    ProductItemList,
    type ProductRowItem,
} from '@/components/products/ProductItemList'
import { useTranslations } from 'next-intl'
import type { ScannedItem } from '@/components/scanner/useMultiScanSession'
import { useFridges } from '@/components/fridges/useFridges'

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
                <Spinner className="w-3 h-3 inline-block" />
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
    const { selectedFridge, setSelectedFridge } = useFridgeSelection(fridges)

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
                <EmptyState
                    title={t('noProductsScanned')}
                    className="py-8 md:py-8"
                />
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
                        <FridgeSelector
                            fridges={fridges}
                            selectedFridge={selectedFridge}
                            onSelect={setSelectedFridge}
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
                                        <Spinner
                                            tone="inverse"
                                            className="w-4 h-4"
                                        />
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
