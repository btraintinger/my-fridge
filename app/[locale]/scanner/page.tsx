'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { addItemToFridge } from '@/lib/services/fridgeService'
import {
    cacheProduct,
    getCachedProduct,
} from '@/lib/services/productService'
import { useFridges } from '@/hooks/useFridges'
import { fetchProductByBarcode } from '@/lib/openFoodFacts'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Camera, Check, Package, Plus, Search, Edit3 } from 'lucide-react'
import { ScannerModal } from '@/components/ScannerModal'
import { ManualProductModal } from '@/components/ManualProductModal'
import type { Product } from '@/lib/types'
import { NUTRI_GRADES } from '@/lib/constants'
import { getNutrimentWarnings } from '@/lib/nutrimentWarnings'
import Image from 'next/image'
import { notify } from '@/lib/notify'

function FlagChip({
    label,
    value,
}: {
    label: string
    value: boolean | null | undefined
}) {
    const t = useTranslations('common')
    const text = value === true ? t('yes') : value === false ? t('no') : t('none')
    const style =
        value === true
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50'
            : value === false
              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50'
              : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700'

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}
        >
            {label}: {text}
        </span>
    )
}

function NutriScoreScale({ grade }: { grade: string }) {
    if (grade === '-') return null
    const active = grade.toLowerCase()
    return (
        <div className="flex items-end gap-1 mt-1">
            {NUTRI_GRADES.map((g) => {
                const isActive = g.grade === active
                return (
                    <div
                        key={g.grade}
                        className={`flex items-center justify-center rounded font-bold text-white transition-all ${g.bg} ${
                            isActive
                                ? 'w-9 h-9 text-base shadow-md'
                                : 'w-7 h-7 text-sm opacity-40'
                        }`}
                    >
                        {g.label}
                    </div>
                )
            })}
        </div>
    )
}

export default function Scanner() {
    const t = useTranslations()
    const { user } = useAuth()
    const [barcode, setBarcode] = useState('')
    const [product, setProduct] = useState<Product | null>(null)
    const [searching, setSearching] = useState(false)
    const [selectedFridge, setSelectedFridge] = useState('')
    const [added, setAdded] = useState(false)
    const [scannerOpen, setScannerOpen] = useState(false)
    const [manualModalOpen, setManualModalOpen] = useState(false)

    const { fridges } = useFridges()
    const warnings = product ? getNutrimentWarnings(product) : []

    useEffect(() => {
        if (fridges.length > 0 && !selectedFridge) {
            setSelectedFridge(fridges[0].id!)
        }
    }, [fridges, selectedFridge])

    const handleSearch = useCallback(async (code: string) => {
        if (!code.trim() || searching) return
        setSearching(true)
        setProduct(null)
        setAdded(false)
        setBarcode(code.trim())
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

        const cached = await getCachedProduct(code.trim())
        if (cached) {
            setProduct(cached)
            setSearching(false)
            return
        }

        if (isOffline) {
            notify.error(t('scanner.errors.offline'))
            setSearching(false)
            return
        }

        try {
            const result = await fetchProductByBarcode(code.trim())
            if (result) {
                setProduct(result)
                await cacheProduct(code.trim(), result)
            } else {
                notify.error(t('scanner.errors.notFound'))
                setBarcode(code.trim())
            }
        } catch (err) {
            console.error('Search error:', err)
            notify.error(t('scanner.errors.searchFailed'))
        } finally {
            setSearching(false)
        }
    }, [searching, t])

    const handleAddToFridge = async () => {
        if (!user || !product || !selectedFridge) return

        await addItemToFridge(selectedFridge, product)
        setAdded(true)
    }

    const handleManualSubmit = async (
        manualProduct: Product,
        options: { quantity: number; expiryDate?: string; notes?: string }
    ) => {
        if (!user || !selectedFridge) return

        await addItemToFridge(selectedFridge, manualProduct, options)

        setProduct(manualProduct)
        setAdded(true)
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-6 lg:pl-20 xl:pl-56">
            <div className="pt-safe">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 pb-5 pt-12 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Camera size={22} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                            {t('scanner.title')}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('scanner.subtitle')}
                        </p>
                    </div>
                </div>
            </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="content-container max-w-2xl space-y-6">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSearch(barcode)
                    }}
                    className="flex gap-2"
                >
                    <Input
                        placeholder={t('scanner.barcodePlaceholder')}
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={searching}>
                        <Search size={20} />
                    </Button>
                </form>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="w-full flex-col h-auto py-4"
                        onClick={() => setScannerOpen(true)}
                    >
                        <Camera size={24} className="mb-2 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold">{t('scanner.cameraScanner')}</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full flex-col h-auto py-4"
                        onClick={() => setManualModalOpen(true)}
                    >
                        <Edit3 size={24} className="mb-2 text-sky-600 dark:text-sky-400" />
                        <span className="text-xs font-semibold">{t('scanner.addManually')}</span>
                    </Button>
                </div>

                {searching && (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {product && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
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
                                        {t('scanner.origin', { country: product.origin_country })}
                                    </p>
                                )}
                                {product.nutriscore_grade && (
                                    <div className="mt-3">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {t('scanner.nutriScore')}
                                        </span>
                                        <NutriScoreScale
                                            grade={product.nutriscore_grade}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <FlagChip
                                label={t('scanner.flags.vegan')}
                                value={product.dietary_flags?.vegan}
                            />
                            <FlagChip
                                label={t('scanner.flags.vegetarian')}
                                value={product.dietary_flags?.vegetarian}
                            />
                            <FlagChip
                                label={t('scanner.flags.palmOilFree')}
                                value={product.dietary_flags?.palm_oil_free}
                            />
                        </div>

                        {warnings.length > 0 && (
                            <div className="space-y-2 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    {t('scanner.nutritionWarningsTitle')}
                                </h3>
                                <div className="space-y-2">
                                    {warnings.map((warning) => (
                                        <div
                                            key={warning.id}
                                            className="text-sm text-amber-900 dark:text-amber-200"
                                        >
                                            <span className="font-semibold">
                                                {t(`nutrimentWarnings.${warning.id}.label` as never)}:
                                            </span>{' '}
                                            {warning.value.toFixed(1)}{' '}
                                            {warning.unit} - {t(`nutrimentWarnings.${warning.id}.${warning.severity}` as never)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {Array.isArray(product.labels) && product.labels.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {t('scanner.labels')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.labels.slice(0, 6).map((label) => (
                                        <span
                                            key={label}
                                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/50"
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                                {t('scanner.nutritionTitle')}
                            </h3>
                            <div className="space-y-2 text-sm">
                                {[
                                    {
                                        label: t('scanner.energy'),
                                        value: product.nutriments.energy_kcal,
                                        unit: 'kcal',
                                    },
                                    {
                                        label: t('scanner.fat'),
                                        value: product.nutriments.fat,
                                        unit: 'g',
                                    },
                                    {
                                        label: t('scanner.saturatedFat'),
                                        value: product.nutriments.saturated_fat,
                                        unit: 'g',
                                    },
                                    {
                                        label: t('scanner.carbohydrates'),
                                        value: product.nutriments.carbohydrates,
                                        unit: 'g',
                                    },
                                    {
                                        label: t('scanner.sugars'),
                                        value: product.nutriments.sugars,
                                        unit: 'g',
                                    },
                                    {
                                        label: t('scanner.proteins'),
                                        value: product.nutriments.proteins,
                                        unit: 'g',
                                    },
                                    {
                                        label: t('scanner.salt'),
                                        value: product.nutriments.salt,
                                        unit: 'g',
                                    },
                                    {
                                        label: t('scanner.fiber'),
                                        value: product.nutriments.fiber,
                                        unit: 'g',
                                    },
                                ].map((row) => (
                                    <div
                                        key={row.label}
                                        className="flex justify-between text-slate-600 dark:text-slate-400"
                                    >
                                        <span>{row.label}</span>
                                        <span className="font-medium text-slate-900 dark:text-slate-50">
                                            {typeof row.value === 'number'
                                                ? row.value.toFixed(1)
                                                : '–'}{' '}
                                            {row.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {product.allergens && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/50">
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                                    {t('scanner.allergens')}
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-300/80">
                                    {product.allergens}
                                </p>
                            </div>
                        )}

                        {!added ? (
                            <div className="space-y-3">
                                {fridges.length > 0 && (
                                    <Select
                                        value={selectedFridge}
                                        onChange={setSelectedFridge}
                                        options={fridges.map((f) => ({
                                            value: f.id!,
                                            label: f.name,
                                        }))}
                                    />
                                )}
                                <Button
                                    className="w-full"
                                    onClick={handleAddToFridge}
                                    disabled={fridges.length === 0}
                                >
                                    <Plus size={20} className="mr-2" />
                                    {t('scanner.addToFridge')}
                                </Button>
                                {fridges.length === 0 && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                        {t('scanner.createFridgeFirst')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-2xl font-semibold border border-emerald-100 dark:border-emerald-900/50">
                                <Check size={20} />
                                {t('scanner.addedToFridge')}
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
            <ScannerModal
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleSearch}
            />
            {manualModalOpen && (
                <ManualProductModal
                    onClose={() => setManualModalOpen(false)}
                    onSubmit={handleManualSubmit}
                />
            )}
        </div>
    )
}
