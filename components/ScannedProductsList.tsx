import { useState } from 'react'
import Image from 'next/image'
import { Package, Trash2, Plus, Check } from 'lucide-react'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { DatePicker } from './ui/DatePicker'
import { QuantityStepper } from './ui/QuantityStepper'
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

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-24">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    {t('multiScanReview')}
                </h2>
                <Button variant="outline" size="sm" onClick={onAddManual}>
                    <Plus size={16} className="mr-1" />
                    {t('addManually')}
                </Button>
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                        Keine Produkte gescannt.
                    </div>
                ) : null}

                {items.map((item) => (
                    <div
                        key={item.barcode}
                        className={`bg-white dark:bg-slate-900 rounded-2xl p-3 flex gap-3 shadow-sm border items-center transition-colors ${
                            item.status === 'error'
                                ? 'border-rose-200 dark:border-rose-900/50'
                                : item.status === 'success'
                                  ? 'border-emerald-200 dark:border-emerald-900/50'
                                  : 'border-slate-100 dark:border-slate-800'
                        }`}
                    >
                        {item.product?.image_url ? (
                            <Image
                                src={item.product.image_url}
                                alt=""
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <Package size={24} />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-50">
                                {item.product?.product_name || item.barcode}
                            </h3>
                            {item.status === 'error' && (
                                <p className="text-xs text-rose-500 font-medium">
                                    {item.error || 'Fehler'}
                                </p>
                            )}
                            {item.status === 'scanning' && (
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" />
                                    Suche...
                                </p>
                            )}
                            {item.status === 'success' && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Check size={12} />
                                    Erkannt
                                </p>
                            )}
                            {item.product?.nutriscore_grade && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600">
                                    Score: {item.product.nutriscore_grade}
                                </span>
                            )}
                            {item.status === 'success' && (
                                <div className="mt-2">
                                    <DatePicker
                                        className="h-8 py-1 px-2 min-h-0 text-xs w-36"
                                        placeholder="Ablaufdatum"
                                        value={item.expiryDate || ''}
                                        onChange={(val) =>
                                            onUpdateExpiryDate(
                                                item.barcode,
                                                val
                                            )
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <QuantityStepper
                                value={item.quantity}
                                onChange={(next) =>
                                    onUpdateQuantity(item.barcode, next)
                                }
                                size="sm"
                            />

                            <button
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                onClick={() => onRemove(item.barcode)}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 z-10 sm:left-20 xl:left-56 lg:bottom-0">
                    <div className="max-w-2xl mx-auto space-y-3">
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
                                        Füge hinzu...
                                    </span>
                                ) : (
                                    'Alle hinzufügen'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
