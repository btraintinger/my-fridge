'use client'

import { use, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import {
    deleteFridge,
    deleteItem,
    shareFridge,
    unshareFridge,
    updateItemQuantity,
    updateItemExpiryDate,
} from '@/lib/services/fridgeService'
import { useFridge } from '@/hooks/useFridges'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { NutriScoreBadge } from '@/components/fridge-details/NutriScoreComponents'
import { ProductDetailModal } from '@/components/fridge-details/ProductDetailModal'
import { FridgeView } from '@/components/fridges/FridgeView'
import { Link, useRouter } from '@/i18n/navigation'
import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    ScanLine,
    Share2,
    Trash2,
    User,
    UserPlus,
    X,
} from 'lucide-react'
import type { FridgeItem } from '@/lib/types'
import { createShareFridgeSchema } from '@/lib/validations'
import { notify } from '@/lib/notify'
import { modalFromCounts } from '@/lib/utils'

export default function FridgeDetail({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const t = useTranslations()
    const router = useRouter()
    const { user } = useAuth()
    const { fridge, items, loading, error } = useFridge(id)
    const [showDeleteFridge, setShowDeleteFridge] = useState(false)
    const [deleteFridgeConfirm, setDeleteFridgeConfirm] = useState('')
    const [deleteFridgeStatus, setDeleteFridgeStatus] = useState('')
    const [deletingFridge, setDeletingFridge] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [shareEmail, setShareEmail] = useState('')
    const [sharing, setSharing] = useState(false)
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
    const [itemToDelete, setItemToDelete] = useState<FridgeItem | null>(null)

    const selectedItem = useMemo(
        () =>
            selectedItemId
                ? (items.find((i) => i.id === selectedItemId) ?? null)
                : null,
        [items, selectedItemId]
    )

    const shareFridgeSchema = useMemo(() => createShareFridgeSchema(t), [t])

    const fridgeNutriScore =
        (fridge?.gradeCounts
            ? modalFromCounts(fridge.gradeCounts)
            : fridge?.modalNutriScore) ?? '-'

    const handleShare = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!user || !fridge || fridge.userId !== user.uid) return

        const parsed = shareFridgeSchema.safeParse({ email: shareEmail })
        if (!parsed.success) {
            notify.error(parsed.error.issues[0].message)
            return
        }

        setSharing(true)
        try {
            await shareFridge(id, parsed.data.email)
            setShareEmail('')
            setShowShare(false)
        } finally {
            setSharing(false)
        }
    }

    const handleUnshare = async (email: string) => {
        if (!user || !fridge || fridge.userId !== user.uid) return
        await unshareFridge(id, email)
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 lg:pl-20 xl:pl-56">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (deletingFridge) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 lg:pl-20 xl:pl-56">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
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
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-6 lg:pl-20 xl:pl-56">
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
                            <button
                                onClick={() => setShowShare(!showShare)}
                                className={`p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${showShare ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                                title={t('fridges.detail.shareTitle')}
                            >
                                <Share2 size={22} />
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteFridgeConfirm('')
                                    setDeleteFridgeStatus('')
                                    setShowDeleteFridge(true)
                                }}
                                className="p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                title={t('fridges.detail.deleteFridgeTooltip')}
                            >
                                <Trash2 size={22} />
                            </button>
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
                    {showShare && fridge.userId === user?.uid && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-emerald-100 dark:border-emerald-900/30 animate-in slide-in-from-top-4 fade-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <UserPlus
                                        size={24}
                                        className="text-emerald-500"
                                    />
                                    {t('fridges.detail.shareHeading')}
                                </h2>
                                <button
                                    onClick={() => setShowShare(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleShare}
                                className="flex gap-2 mb-6"
                            >
                                <Input
                                    type="email"
                                    placeholder={t(
                                        'fridges.detail.shareEmailPlaceholder'
                                    )}
                                    value={shareEmail}
                                    onChange={(e) =>
                                        setShareEmail(e.target.value)
                                    }
                                    required
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={sharing}>
                                    {sharing ? '...' : t('common.invite')}
                                </Button>
                            </form>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                    {t('fridges.detail.sharedWith')}
                                </h3>
                                {!fridge.sharedWithEmails ||
                                fridge.sharedWithEmails.length === 0 ? (
                                    <p className="text-sm text-slate-400 dark:text-slate-500 italic px-1">
                                        {t('fridges.detail.noOneYet')}
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {fridge.sharedWithEmails.map(
                                            (email) => (
                                                <div
                                                    key={email}
                                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                                            <User size={16} />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-none">
                                                            {email}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleUnshare(email)
                                                        }
                                                        className="text-slate-300 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                                                        title={t(
                                                            'fridges.detail.removeAccess'
                                                        )}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                    onClose={() => setSelectedItemId(null)}
                />
            )}

            {showDeleteFridge && fridge.userId === user?.uid && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-rose-100 dark:border-rose-900/50">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                setDeleteFridgeStatus('')
                                if (
                                    deleteFridgeConfirm !==
                                    t('fridges.detail.deleteFridgeConfirmText')
                                ) {
                                    setDeleteFridgeStatus(
                                        t(
                                            'fridges.detail.deleteFridgeTypeConfirm'
                                        )
                                    )
                                    return
                                }
                                setDeletingFridge(true)
                                try {
                                    await deleteFridge(id)
                                    router.push('/fridges?list=1')
                                } catch {
                                    setDeleteFridgeStatus(
                                        t('fridges.detail.deleteFridgeFailed')
                                    )
                                    setDeletingFridge(false)
                                }
                            }}
                        >
                            <div className="p-6 space-y-4">
                                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 text-center">
                                    {t('fridges.detail.deleteFridgeTitle')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                    {t('fridges.detail.deleteFridgeWarning', {
                                        name: fridge.name,
                                    })}
                                </p>
                                <Input
                                    type="text"
                                    value={deleteFridgeConfirm}
                                    onChange={(e) =>
                                        setDeleteFridgeConfirm(e.target.value)
                                    }
                                    placeholder={t(
                                        'fridges.detail.deleteFridgeConfirmText'
                                    )}
                                    required
                                    autoFocus
                                />
                                {deleteFridgeStatus && (
                                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                                        {deleteFridgeStatus}
                                    </p>
                                )}
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowDeleteFridge(false)}
                                    disabled={deletingFridge}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={deletingFridge}
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                    {deletingFridge
                                        ? t(
                                              'fridges.detail.deleteFridgeSubmitting'
                                          )
                                        : t(
                                              'fridges.detail.deleteFridgeSubmit'
                                          )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {itemToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                {t('fridges.detail.deleteProductTitle')}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {t('fridges.detail.deleteProductConfirm', {
                                    name: itemToDelete.product.product_name,
                                })}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setItemToDelete(null)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-transparent"
                                onClick={async () => {
                                    await deleteItem(id, itemToDelete.id!, {
                                        grade: itemToDelete.product
                                            .nutriscore_grade,
                                        quantity: itemToDelete.quantity ?? 1,
                                        itemName:
                                            itemToDelete.product.product_name,
                                    })
                                    setItemToDelete(null)
                                }}
                            >
                                {t('common.delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
