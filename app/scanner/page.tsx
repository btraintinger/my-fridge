'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { fridgeService, productService } from '../../lib/services/fridgeService'
import { useFridges } from '../../hooks/useFridges'
import { fetchProductByBarcode } from '../../lib/openFoodFacts'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Camera, Check, Package, Plus, Search } from 'lucide-react'
import { ScannerModal } from '../../components/ScannerModal'
import type { Fridge, Product } from '../../lib/types'
import { NUTRI_GRADES } from '@/lib/constants'
import Image from 'next/image'

function NutriScoreScale({ grade }: { grade: string }) {
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
    const { user } = useAuth()
    const [barcode, setBarcode] = useState('')
    const [product, setProduct] = useState<Product | null>(null)
    const [searching, setSearching] = useState(false)
    const [selectedFridge, setSelectedFridge] = useState('')
    const [added, setAdded] = useState(false)
    const [scannerOpen, setScannerOpen] = useState(false)
    
    const { fridges } = useFridges()

    useEffect(() => {
        if (fridges.length > 0 && !selectedFridge) {
            setSelectedFridge(fridges[0].id)
        }
    }, [fridges, selectedFridge])

    const handleSearch = useCallback(async (code: string) => {
        if (!code.trim()) return
        setSearching(true)
        setProduct(null)
        setAdded(false)
        setBarcode(code.trim())

        // Check cache first
        const cached = await productService.getCachedProduct(code.trim())
        if (cached) {
            setProduct(cached)
            setSearching(false)
            return
        }

        try {
            const result = await fetchProductByBarcode(code.trim())
            if (result) {
                setProduct(result)
                // Save to cache
                await productService.cacheProduct(code.trim(), result)
            }
        } finally {
            setSearching(false)
        }
    }, [])

    const handleAddToFridge = async () => {
        if (!user || !product || !selectedFridge) return

        await fridgeService.addItemToFridge(selectedFridge, product)
        setAdded(true)
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="pt-12 px-6 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    Scan Product
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Scan a barcode or search manually
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Manual Search */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSearch(barcode)
                    }}
                    className="flex gap-2"
                >
                    <Input
                        placeholder="Enter barcode (e.g. 9012501000053)"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={searching}>
                        <Search size={20} />
                    </Button>
                </form>

                {/* Camera Scanner */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setScannerOpen(true)}
                >
                    <Camera size={20} className="mr-2" />
                    Open Camera Scanner
                </Button>

                {/* Loading */}
                {searching && (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Product Preview */}
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
                                {product.nutriscore_grade && (
                                    <div className="mt-3">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Nutri-Score
                                        </span>
                                        <NutriScoreScale
                                            grade={product.nutriscore_grade}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nutriments Table */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                                Nutritional Values (per 100g)
                            </h3>
                            <div className="space-y-2 text-sm">
                                {[
                                    {
                                        label: 'Energy',
                                        value: product.nutriments.energy_kcal,
                                        unit: 'kcal',
                                    },
                                    {
                                        label: 'Fat',
                                        value: product.nutriments.fat,
                                        unit: 'g',
                                    },
                                    {
                                        label: 'Carbohydrates',
                                        value: product.nutriments.carbohydrates,
                                        unit: 'g',
                                    },
                                    {
                                        label: 'Sugars',
                                        value: product.nutriments.sugars,
                                        unit: 'g',
                                    },
                                    {
                                        label: 'Proteins',
                                        value: product.nutriments.proteins,
                                        unit: 'g',
                                    },
                                    {
                                        label: 'Salt',
                                        value: product.nutriments.salt,
                                        unit: 'g',
                                    },
                                    {
                                        label: 'Fiber',
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

                        {/* Allergens */}
                        {product.allergens && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/50">
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                                    Allergens
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-300/80">
                                    {product.allergens}
                                </p>
                            </div>
                        )}

                        {/* Add to Fridge Selector */}
                        {!added ? (
                            <div className="space-y-3">
                                {fridges.length > 0 && (
                                    <select
                                        value={selectedFridge}
                                        onChange={(e) =>
                                            setSelectedFridge(e.target.value)
                                        }
                                        className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-base font-medium text-slate-900 dark:text-slate-50 focus:border-emerald-500 focus:outline-none"
                                    >
                                        {fridges.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <Button
                                    className="w-full"
                                    onClick={handleAddToFridge}
                                    disabled={fridges.length === 0}
                                >
                                    <Plus size={20} className="mr-2" />
                                    Add to Fridge
                                </Button>
                                {fridges.length === 0 && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                        Create a fridge first to add products.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-2xl font-semibold border border-emerald-100 dark:border-emerald-900/50">
                                <Check size={20} />
                                Added to fridge!
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ScannerModal
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleSearch}
            />
        </div>
    )
}
