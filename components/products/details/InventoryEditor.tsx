'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DatePicker } from '@/components/forms/DatePicker'
import { QuantityStepper } from '@/components/forms/QuantityStepper'
import { notify } from '@/lib/notify'

export function InventoryEditor({
    quantity,
    expiryDate,
    itemId,
    fridgeId,
    onQuantityChange,
    onExpiryDateChange,
}: {
    quantity: number
    expiryDate: string
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
}) {
    const t = useTranslations('productModal')
    const [savingExpiryDate, setSavingExpiryDate] = useState(false)

    const commitQuantity = async (next: number) => {
        if (!itemId || !fridgeId || !onQuantityChange) return
        if (next < 1 || next === quantity) return
        await onQuantityChange(itemId, fridgeId, next)
    }

    return (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200/70 dark:border-emerald-900/50 space-y-4">
            <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                    {t('inventory')}
                </h3>
                <QuantityStepper
                    value={quantity}
                    onChange={commitQuantity}
                    disabled={!onQuantityChange}
                    tone="emerald"
                    inputAriaLabel={t('inventory')}
                />
            </div>

            {itemId && fridgeId && (
                <div className="pt-4 border-t border-emerald-200/50 dark:border-emerald-900/50">
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                        {t('expiryDateOptional')}
                    </h3>
                    <DatePicker
                        value={expiryDate}
                        onChange={async (val) => {
                            if (!onExpiryDateChange) return
                            setSavingExpiryDate(true)
                            try {
                                await onExpiryDateChange(itemId, fridgeId, val)
                            } catch {
                                notify.error(t('expiryDateUpdateError'))
                            } finally {
                                setSavingExpiryDate(false)
                            }
                        }}
                        placeholder={t('expiryDatePlaceholder')}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={savingExpiryDate}
                        className="w-full sm:w-64"
                    />
                </div>
            )}
        </div>
    )
}
