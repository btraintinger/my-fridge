'use client'

import { PageShell } from '@/components/layout/Page'
import { TooltipButton } from '@/components/feedback/TooltipButton'

import { Spinner } from '@/components/feedback/Spinner'
import { use, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import {
    updateItemQuantity,
    updateItemExpiryDate,
    updateItemCategory,
} from '@/lib/services/fridgeService'
import { useFridge } from '@/components/fridges/useFridges'
import { Button } from '@/components/ui/button'
import { NutriScoreBadge } from '@/components/products/NutriScore'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'
import { FridgeView } from '@/components/fridges/FridgeView'
import { Link } from '@/i18n/navigation'
import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    ScanLine,
    Share2,
    Trash2,
} from 'lucide-react'
import type { FridgeItem } from '@/lib/types'
import { modalFromCounts } from '@/lib/utils'
import { ShareFridgePanel } from '@/components/fridges/detail/ShareFridgePanel'
import {
    DeleteFridgeDialog,
    useFridgeDeletion,
} from '@/components/fridges/detail/DeleteFridgeDialog'
import { DeleteProductDialog } from '@/components/fridges/detail/DeleteProductDialog'

export default function FridgeDetail({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const t = useTranslations()
    const { user } = useAuth()
    const { fridge, items, loading, error } = useFridge(id)
    const deletion = useFridgeDeletion(id)
    const { showDeleteFridge, deletingFridge, openDeleteFridge } = deletion
    const [showShare, setShowShare] = useState(false)
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
    const [itemToDelete, setItemToDelete] = useState<FridgeItem | null>(null)

    const selectedItem = useMemo(
        () =>
            selectedItemId
                ? (items.find((i) => i.id === selectedItemId) ?? null)
                : null,
        [items, selectedItemId]
    )

    const fridgeNutriScore =
        (fridge?.gradeCounts
            ? modalFromCounts(fridge.gradeCounts)
            : fridge?.modalNutriScore) ?? '-'

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 lg:pl-20 xl:pl-56">
                <Spinner className="w-10 h-10" />
            </div>
        )
    }

    if (deletingFridge) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 lg:pl-20 xl:pl-56">
                <Spinner className="w-10 h-10" />
            </div>
        )
    }

    if (error || !fridge) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center lg:pl-20 xl:pl-56">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-inner">
                    <AlertCircle size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                    {t('common.oops')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
                    {error || t('fridges.detail.fridgeNotFound')}
                </p>
                <Link href="/fridges?list=1">
                    <Button variant="outline">
                        {t('fridges.detail.backToFridges')}
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <PageShell>
            <div className="pt-safe">
                <div className="pt-12 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 flex items-center gap-3 sm:gap-4 shadow-sm">
                    <Link
                        href="/fridges?list=1"
                        className="p-2.5 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 truncate flex-1">
                        {fridge.name}
                    </h1>
                    {fridge.userId === user?.uid && (
                        <>
                            <TooltipButton
                                aria-label={t('fridges.detail.shareTitle')}
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => setShowShare(!showShare)}
                                className={`p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${showShare ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                                tooltip={t('fridges.detail.shareTitle')}
                            >
                                <Share2 size={22} />
                            </TooltipButton>
                            <TooltipButton
                                aria-label={t(
                                    'fridges.detail.deleteFridgeTooltip'
                                )}
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={openDeleteFridge}
                                className="p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                tooltip={t(
                                    'fridges.detail.deleteFridgeTooltip'
                                )}
                            >
                                <Trash2 size={22} />
                            </TooltipButton>
                        </>
                    )}
                    <Link href="/scanner">
                        <Button size="sm" className="rounded-xl">
                            <ScanLine size={18} className="mr-1" />{' '}
                            {t('fridges.detail.addButton')}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col space-y-6 sm:space-y-8">
                <div className="content-container w-full space-y-6 sm:space-y-8">
                    <ShareFridgePanel
                        fridgeId={id}
                        fridge={fridge}
                        open={showShare}
                        onClose={() => setShowShare(false)}
                    />

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                                <BarChart3 size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                    {t('fridges.detail.nutriScoreLabel')}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                    <NutriScoreBadge grade={fridgeNutriScore} />
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {t('fridges.detail.productsCount', {
                                            count: items.length,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Link href={`/fridges/${id}/analysis`}>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto rounded-xl"
                            >
                                {t('fridges.detail.moreAnalysis')}
                            </Button>
                        </Link>
                    </div>

                    <FridgeView
                        items={items}
                        onItemClick={(item) =>
                            setSelectedItemId(item.id ?? null)
                        }
                        onDeleteRequest={setItemToDelete}
                        onQuantityChange={async (itemId, quantity) => {
                            const item = items.find((i) => i.id === itemId)
                            if (item) {
                                await updateItemQuantity(id, itemId, quantity, {
                                    grade: item.product?.nutriscore_grade,
                                    quantity: item.quantity ?? 1,
                                })
                            }
                        }}
                        onExpiryDateChange={async (itemId, date) => {
                            await updateItemExpiryDate(id, itemId, date)
                        }}
                    />
                </div>
            </div>

            {selectedItem && (
                <ProductDetailModal
                    product={selectedItem.product}
                    quantity={selectedItem.quantity ?? 1}
                    expiryDate={selectedItem.expiryDate}
                    itemId={selectedItem.id}
                    fridgeId={id}
                    onQuantityChange={async (itemId, fridgeId, quantity) => {
                        await updateItemQuantity(fridgeId, itemId, quantity, {
                            grade: selectedItem.product?.nutriscore_grade,
                            quantity: selectedItem.quantity ?? 1,
                        })
                    }}
                    onExpiryDateChange={async (
                        itemId,
                        fridgeId,
                        expiryDate
                    ) => {
                        await updateItemExpiryDate(fridgeId, itemId, expiryDate)
                    }}
                    onDelete={async () => {
                        setSelectedItemId(null)
                        setItemToDelete(selectedItem)
                    }}
                    onCategoryChange={(itemId, fridgeId, category) =>
                        updateItemCategory(fridgeId, itemId, category)
                    }
                    onClose={() => setSelectedItemId(null)}
                />
            )}

            {showDeleteFridge && fridge.userId === user?.uid && (
                <DeleteFridgeDialog
                    fridgeName={fridge.name}
                    deletion={deletion}
                />
            )}

            {itemToDelete && (
                <DeleteProductDialog
                    fridgeId={id}
                    itemToDelete={itemToDelete}
                    onClose={() => setItemToDelete(null)}
                />
            )}
        </PageShell>
    )
}
