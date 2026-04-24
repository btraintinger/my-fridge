import { AlertCircle, ChefHat, Info, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { NutriScoreBadge } from './NutriScoreComponents'
import type { Product } from '../../lib/types'
import Image from 'next/image'

interface ProductDetailModalProps {
    product: Product
    onClose: () => void
}

export function ProductDetailModal({
    product,
    onClose,
}: ProductDetailModalProps) {
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
                            {product.brands || 'Unknown Brand'}
                        </p>
                    </div>

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
