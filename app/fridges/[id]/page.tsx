'use client'

import { FormEvent, use, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { fridgeService } from '../../../lib/services/fridgeService'
import { useFridge } from '../../../hooks/useFridges'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import {
    NutriScoreBadge,
} from '../../../components/fridge-details/NutriScoreComponents'
import { ProductDetailModal } from '../../../components/fridge-details/ProductDetailModal'
import Link from 'next/link'
import Image from 'next/image'
import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    ChefHat,
    Info,
    ScanLine,
    Share2,
    Trash2,
    User,
    UserPlus,
    X,
} from 'lucide-react'
import type { FridgeItem } from '../../../lib/types'
import { modalNutriScore } from '../../../lib/utils'

export default function FridgeDetail({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const { user } = useAuth()
    const { fridge, items, loading, error } = useFridge(id)
    const [showShare, setShowShare] = useState(false)
    const [shareEmail, setShareEmail] = useState('')
    const [sharing, setSharing] = useState(false)
    const [selectedItem, setSelectedItem] = useState<FridgeItem | null>(null)
    const [editingQuantityItemId, setEditingQuantityItemId] = useState<
        string | null
    >(null)
    const [quantityDraft, setQuantityDraft] = useState('1')
    const [savingQuantityItemId, setSavingQuantityItemId] = useState<
        string | null
    >(null)
    const [swipeItemId, setSwipeItemId] = useState<string | null>(null)
    const [swipeOffset, setSwipeOffset] = useState(0)
    const swipeOffsetRef = useRef(0)
    const swipeSessionRef = useRef<{
        itemId: string
        pointerId: number
        startX: number
        startY: number
        active: boolean
    } | null>(null)
    const suppressNextClickRef = useRef<string | null>(null)

    const fridgeNutriScore = useMemo(
        () => modalNutriScore(items.map((item) => item.product?.nutriscore_grade ?? null)),
        [items]
    )

    const handleShare = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (
            !user ||
            !shareEmail.trim() ||
            !fridge ||
            fridge.userId !== user.uid
        )
            return

        setSharing(true)
        try {
            await fridgeService.shareFridge(id, shareEmail)
            setShareEmail('')
            setShowShare(false)
        } finally {
            setSharing(false)
        }
    }

    const handleUnshare = async (email: string) => {
        if (!user || !fridge || fridge.userId !== user.uid) return
        await fridgeService.unshareFridge(id, email)
    }

    const startQuantityEdit = (item: FridgeItem) => {
        setEditingQuantityItemId(item.id)
        setQuantityDraft(String(item.quantity ?? 1))
    }

    const saveQuantity = async (itemId: string) => {
        const parsed = Number.parseInt(quantityDraft, 10)
        if (!Number.isFinite(parsed) || parsed < 1) return

        setSavingQuantityItemId(itemId)
        try {
            await fridgeService.updateItemQuantity(id, itemId, parsed)
            setEditingQuantityItemId(null)
        } finally {
            setSavingQuantityItemId(null)
        }
    }

    const deleteFridgeItem = async (itemId: string) => {
        await fridgeService.deleteItem(id, itemId)
        if (selectedItem?.id === itemId) {
            setSelectedItem(null)
        }
    }

    const beginSwipe = (
        itemId: string,
        pointerId: number,
        clientX: number,
        clientY: number
    ) => {
        swipeSessionRef.current = {
            itemId,
            pointerId,
            startX: clientX,
            startY: clientY,
            active: true,
        }
        setSwipeItemId(itemId)
        setSwipeOffset(0)
        swipeOffsetRef.current = 0
    }

    const updateSwipe = (clientX: number, clientY: number) => {
        const session = swipeSessionRef.current
        if (!session?.active) return

        const deltaX = clientX - session.startX
        const deltaY = clientY - session.startY

        if (Math.abs(deltaY) > 18 && Math.abs(deltaY) > Math.abs(deltaX)) {
            session.active = false
            setSwipeItemId(null)
            setSwipeOffset(0)
            swipeOffsetRef.current = 0
            return
        }

        if (deltaX < 0) {
            const nextOffset = Math.max(deltaX, -96)
            swipeOffsetRef.current = nextOffset
            setSwipeOffset(nextOffset)
        }
    }

    const endSwipe = async () => {
        const session = swipeSessionRef.current
        if (!session?.active) return

        const shouldDelete = swipeOffsetRef.current < -64
        const itemId = session.itemId

        swipeSessionRef.current = null
        setSwipeItemId(null)

        if (shouldDelete) {
            suppressNextClickRef.current = itemId
            swipeOffsetRef.current = -96
            setSwipeOffset(-96)
            await deleteFridgeItem(itemId)
        } else {
            swipeOffsetRef.current = 0
            setSwipeOffset(0)
        }
    }

    const handleItemPointerDown = (
        itemId: string,
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (event.pointerType !== 'touch') return
        event.currentTarget.setPointerCapture(event.pointerId)
        beginSwipe(itemId, event.pointerId, event.clientX, event.clientY)
    }

    const handleItemPointerMove = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (event.pointerType !== 'touch') return
        if (swipeSessionRef.current?.pointerId !== event.pointerId) return
        updateSwipe(event.clientX, event.clientY)
    }

    const handleItemPointerUp = async (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (event.pointerType !== 'touch') return
        if (swipeSessionRef.current?.pointerId !== event.pointerId) return
        try {
            event.currentTarget.releasePointerCapture(event.pointerId)
        } catch {
            // Ignore release failures when the pointer was already released.
        }
        await endSwipe()
    }

    const handleItemClick = (item: FridgeItem) => {
        if (suppressNextClickRef.current === item.id) {
            suppressNextClickRef.current = null
            return
        }
        if (swipeOffsetRef.current !== 0) return
        setSelectedItem(item)
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error || !fridge) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-inner">
                    <AlertCircle size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                    Oops
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
                    {error || 'Fridge not found'}
                </p>
                <Link href="/fridges">
                    <Button variant="outline">Back to Fridges</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="pt-12 px-6 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
                <Link
                    href="/fridges"
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                >
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 truncate flex-1">
                    {fridge.name}
                </h1>
                {fridge.userId === user?.uid && (
                    <button
                        onClick={() => setShowShare(!showShare)}
                        className={`p-2 rounded-full transition-colors ${showShare ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                        title="Share Fridge"
                    >
                        <Share2 size={24} />
                    </button>
                )}
                <Link href="/scanner">
                    <Button size="sm" className="rounded-xl">
                        <ScanLine size={18} className="mr-1" /> Add
                    </Button>
                </Link>
            </div>

            <div className="p-6 flex-1 flex flex-col space-y-8">
                {/* Sharing Section */}
                {showShare && fridge.userId === user?.uid && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-emerald-100 dark:border-emerald-900/30 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <UserPlus
                                    size={24}
                                    className="text-emerald-500"
                                />
                                Share Access
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
                                placeholder="Collaborator's email"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                required
                                className="flex-1"
                            />
                            <Button type="submit" disabled={sharing}>
                                {sharing ? '...' : 'Invite'}
                            </Button>
                        </form>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                Shared with
                            </h3>
                            {!fridge.sharedWithEmails ||
                            fridge.sharedWithEmails.length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500 italic px-1">
                                    No one yet
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {fridge.sharedWithEmails.map((email) => (
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
                                                title="Remove access"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
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
                                Nutri-Score
                            </p>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                                <NutriScoreBadge grade={fridgeNutriScore} />
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {items.length} Product{items.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Link href={`/fridges/${id}/analysis`}>
                        <Button variant="outline" className="w-full sm:w-auto rounded-xl">
                            Weitere Analyse
                        </Button>
                    </Link>
                </div>

                {/* Inventory */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            Inventory
                        </h3>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-4xl p-16 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                                <ChefHat size={40} strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mb-8">
                                Your fridge is empty. Scan items to fill it up!
                            </p>
                            <Link href="/scanner">
                                <Button variant="outline">
                                    Start Scanning
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item) => (
                                <div key={item.id} className="relative overflow-hidden rounded-2xl">
                                    <div
                                        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center rounded-r-2xl bg-rose-500/95 text-white opacity-0 transition-opacity"
                                        aria-hidden="true"
                                    >
                                        <div className="flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                                            <Trash2 size={16} />
                                            Delete
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => handleItemClick(item)}
                                        onPointerDown={(event) =>
                                            handleItemPointerDown(item.id, event)
                                        }
                                        onPointerMove={handleItemPointerMove}
                                        onPointerUp={handleItemPointerUp}
                                        onPointerCancel={handleItemPointerUp}
                                        className={`group bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all cursor-pointer active:scale-[0.98] flex items-center gap-3 ${swipeItemId === item.id ? 'touch-none' : ''}`}
                                        style={{
                                            transform:
                                                swipeItemId === item.id
                                                    ? `translateX(${swipeOffset}px)`
                                                    : undefined,
                                            transition:
                                                swipeItemId === item.id
                                                    ? 'none'
                                                    : 'transform 180ms ease',
                                            touchAction: 'pan-y',
                                            willChange:
                                                swipeItemId === item.id
                                                    ? 'transform'
                                                    : undefined,
                                        }}
                                    >
                                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {item.product?.image_url ? (
                                                <Image
                                                    src={item.product.image_url}
                                                    alt={item.product.product_name}
                                                    width={56}
                                                    height={56}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-[9px] text-slate-300 dark:text-slate-600 p-1 text-center font-bold uppercase leading-tight">
                                                    <ChefHat
                                                        size={16}
                                                        className="mb-0.5"
                                                    />
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {item.product.product_name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                                                {item.product.brands || '-'}
                                            </p>
                                            <div
                                                className="flex items-center gap-1.5 flex-wrap"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {editingQuantityItemId ===
                                                item.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            step={1}
                                                            value={quantityDraft}
                                                            onChange={(e) =>
                                                                setQuantityDraft(
                                                                    e.target.value
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key ===
                                                                    'Enter'
                                                                ) {
                                                                    e.preventDefault()
                                                                    saveQuantity(
                                                                        item.id
                                                                    )
                                                                }
                                                            }}
                                                            className="h-7 w-16 text-xs"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-7 px-2 text-xs"
                                                            disabled={
                                                                savingQuantityItemId ===
                                                                item.id
                                                            }
                                                            onClick={() =>
                                                                saveQuantity(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 px-2 text-xs"
                                                            onClick={() =>
                                                                setEditingQuantityItemId(
                                                                    null
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 px-2 py-0.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors whitespace-nowrap"
                                                            onClick={() =>
                                                                startQuantityEdit(item)
                                                            }
                                                        >
                                                            Q: {item.quantity ?? 1}
                                                        </button>
                                                        <NutriScoreBadge
                                                            grade={
                                                                item.product
                                                                    ?.nutriscore_grade
                                                            }
                                                            size="sm"
                                                        />
                                                        {item.product.dietary_flags
                                                            ?.vegan && (
                                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                                Vegan
                                                            </span>
                                                        )}
                                                        {item.product.labels?.includes('Manuell') && (
                                                            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                                Manuell
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 dark:text-slate-600">
                                            <Info size={18} />
                                        </div>
                                        {swipeItemId === item.id && swipeOffset < 0 && (
                                            <div
                                                className="absolute inset-y-0 right-0 rounded-r-2xl bg-rose-500/90"
                                                style={{
                                                    width: `${Math.min(20, Math.abs(swipeOffset) / 4)}px`,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedItem && (
                <ProductDetailModal
                    product={selectedItem.product}
                    quantity={selectedItem.quantity ?? 1}
                    itemId={selectedItem.id}
                    fridgeId={id}
                    onQuantityChange={async (itemId, fridgeId, quantity) => {
                        await fridgeService.updateItemQuantity(fridgeId, itemId, quantity)
                    }}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    )
}
