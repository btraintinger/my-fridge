'use client'

import { use, useMemo, useRef, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import {
    deleteFridge,
    deleteItem,
    shareFridge,
    unshareFridge,
    updateItemQuantity,
} from '@/lib/services/fridgeService'
import { useFridge } from '@/hooks/useFridges'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
    NutriScoreBadge,
} from '@/components/fridge-details/NutriScoreComponents'
import { ProductDetailModal } from '@/components/fridge-details/ProductDetailModal'
import { Link, useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import {
    AlertCircle,
    ArrowLeft,
    ArrowUpDown,
    BarChart3,
    ChefHat,
    ChevronDown,
    ChevronRight,
    Filter,
    Info,
    Search,
    ScanLine,
    Share2,
    Trash2,
    User,
    UserPlus,
    X,
} from 'lucide-react'
import type { FridgeItem } from '@/lib/types'
import { modalNutriScore } from '@/lib/utils'
import {
    createShareFridgeSchema,
    createItemQuantitySchema,
} from '@/lib/validations'
import { notify } from '@/lib/notify'

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

    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<string>('name-asc')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [isSortInitialized, setIsSortInitialized] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
    const [itemToDelete, setItemToDelete] = useState<FridgeItem | null>(null)

    const shareFridgeSchema = useMemo(() => createShareFridgeSchema(t), [t])
    const itemQuantitySchema = useMemo(() => createItemQuantitySchema(t), [t])

    useEffect(() => {
        const savedSort = localStorage.getItem('fridgeSortPreference')
        if (savedSort) {
            setSortBy(savedSort)
        }
        setIsSortInitialized(true)
    }, [])

    useEffect(() => {
        if (isSortInitialized) {
            localStorage.setItem('fridgeSortPreference', sortBy)
        }
    }, [sortBy, isSortInitialized])

    const CATEGORY_KEYWORDS: Record<string, string[]> = {
        dairy: ['milch', 'käse', 'joghurt', 'butter', 'sahne', 'quark', 'milk', 'cheese', 'yogurt', 'dairy'],
        meat: ['fleisch', 'wurst', 'schinken', 'hähnchen', 'rind', 'schwein', 'meat', 'chicken', 'beef', 'pork', 'speck'],
        veg: ['gemüse', 'tomate', 'gurke', 'paprika', 'salat', 'karotte', 'vegetable', 'tomato', 'cucumber', 'pepper', 'salad', 'carrot', 'zwiebel', 'knoblauch'],
        fruit: ['obst', 'apfel', 'banane', 'orange', 'beere', 'fruit', 'apple', 'banana', 'orange', 'berry', 'zitrone'],
        drinks: ['saft', 'wasser', 'cola', 'limo', 'bier', 'wein', 'drink', 'water', 'juice', 'beer', 'wine', 'getränk']
    }

    const filteredAndSortedItems = useMemo(() => {
        let result = [...items]

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(item =>
                item.product.product_name?.toLowerCase().includes(query) ||
                item.product.brands?.toLowerCase().includes(query)
            )
        }

        if (filterCategory !== 'all') {
            const keywords = CATEGORY_KEYWORDS[filterCategory]
            if (keywords) {
                result = result.filter(item => {
                    const text = `${item.product.product_name} ${item.product.ingredients} ${item.product.labels?.join(' ')}`.toLowerCase()
                    return keywords.some(kw => text.includes(kw))
                })
            }
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return (a.product.product_name || '').localeCompare(b.product.product_name || '')
                case 'name-desc':
                    return (b.product.product_name || '').localeCompare(a.product.product_name || '')
                case 'quantity-asc':
                    return (a.quantity ?? 1) - (b.quantity ?? 1)
                case 'quantity-desc':
                    return (b.quantity ?? 1) - (a.quantity ?? 1)
                case 'nutri-asc': {
                    const gradeA = a.product.nutriscore_grade || 'z'
                    const gradeB = b.product.nutriscore_grade || 'z'
                    return gradeA.localeCompare(gradeB)
                }
                case 'nutri-desc': {
                    const gradeA = a.product.nutriscore_grade || 'a'
                    const gradeB = b.product.nutriscore_grade || 'a'
                    return gradeB.localeCompare(gradeA)
                }
                case 'expiry-asc': {
                    const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity
                    const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity
                    return dateA - dateB
                }
                default:
                    return 0
            }
        })

        return result
    }, [items, searchQuery, filterCategory, sortBy])

    const groupedItems = useMemo(() => {
        const groups: Record<string, FridgeItem[]> = {}
        filteredAndSortedItems.forEach(item => {
            const cat = item.product.category || t('fridges.detail.categories.other')
            if (!groups[cat]) groups[cat] = []
            groups[cat].push(item)
        })
        return groups
    }, [filteredAndSortedItems, t])

    const CATEGORY_ORDER = [
        'Milchprodukte',
        'Fleisch & Fisch',
        'Gemüse & Obst',
        'Getränke',
        'Snacks & Süßes',
        'Tiefkühl',
        'Sonstiges',
        t('fridges.detail.categories.dairy'),
        t('fridges.detail.categories.meatFish'),
        t('fridges.detail.categories.vegFruit'),
        t('fridges.detail.categories.drinks'),
        t('fridges.detail.categories.snacks'),
        t('fridges.detail.categories.frozen'),
        t('fridges.detail.categories.other'),
    ]

    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        const idxA = CATEGORY_ORDER.indexOf(a)
        const idxB = CATEGORY_ORDER.indexOf(b)
        if (idxA === -1 && idxB === -1) return a.localeCompare(b)
        if (idxA === -1) return 1
        if (idxB === -1) return -1
        return idxA - idxB
    })

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [cat]: !prev[cat] ? true : false
        }))
    }

    const isCategoryExpanded = (cat: string) => expandedCategories[cat]

    const fridgeNutriScore = useMemo(
        () => modalNutriScore(items.map((item) => item.product?.nutriscore_grade ?? null)),
        [items]
    )

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

    const startQuantityEdit = (item: FridgeItem) => {
        setEditingQuantityItemId(item.id)
        setQuantityDraft(String(item.quantity ?? 1))
    }

    const saveQuantity = async (itemId: string) => {
        const parsed = itemQuantitySchema.safeParse({
            quantity: Number.parseInt(quantityDraft, 10),
        })
        if (!parsed.success) {
            notify.error(parsed.error.issues[0].message)
            return
        }

        setSavingQuantityItemId(itemId)
        try {
            await updateItemQuantity(
                id,
                itemId,
                parsed.data.quantity
            )
            setEditingQuantityItemId(null)
        } finally {
            setSavingQuantityItemId(null)
        }
    }

    const deleteFridgeItem = async (itemId: string) => {
        const item = items.find((i) => i.id === itemId)
        await deleteItem(id, itemId, item?.product?.product_name)
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
            const itemToDel = items.find((i) => i.id === itemId)
            if (itemToDel) {
                setItemToDelete(itemToDel)
            }
            swipeOffsetRef.current = 0
            setSwipeOffset(0)
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
                    <Button variant="outline">{t('fridges.detail.backToFridges')}</Button>
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
                            <ScanLine size={18} className="mr-1" /> {t('fridges.detail.addButton')}
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
                                    placeholder={t('fridges.detail.shareEmailPlaceholder')}
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
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
                                                    title={t('fridges.detail.removeAccess')}
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
                                    {t('fridges.detail.nutriScoreLabel')}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                    <NutriScoreBadge grade={fridgeNutriScore} />
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {t('fridges.detail.productsCount', { count: filteredAndSortedItems.length })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Link href={`/fridges/${id}/analysis`}>
                            <Button variant="outline" className="w-full sm:w-auto rounded-xl">
                                {t('fridges.detail.moreAnalysis')}
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                type="text"
                                placeholder={t('fridges.detail.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 py-2 text-sm rounded-xl"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select
                                size="sm"
                                className="flex-1"
                                value={filterCategory}
                                onChange={setFilterCategory}
                                icon={<Filter size={16} />}
                                options={[
                                    { value: 'all', label: t('fridges.detail.filters.allCategories') },
                                    { value: 'dairy', label: t('fridges.detail.filters.dairy') },
                                    { value: 'meat', label: t('fridges.detail.filters.meat') },
                                    { value: 'veg', label: t('fridges.detail.filters.veg') },
                                    { value: 'fruit', label: t('fridges.detail.filters.fruit') },
                                    { value: 'drinks', label: t('fridges.detail.filters.drinks') },
                                ]}
                            />
                            <Select
                                size="sm"
                                className="flex-1"
                                value={sortBy}
                                onChange={setSortBy}
                                icon={<ArrowUpDown size={16} />}
                                options={[
                                    { value: 'name-asc', label: t('fridges.detail.sort.nameAsc') },
                                    { value: 'name-desc', label: t('fridges.detail.sort.nameDesc') },
                                    { value: 'quantity-asc', label: t('fridges.detail.sort.quantityAsc') },
                                    { value: 'quantity-desc', label: t('fridges.detail.sort.quantityDesc') },
                                    { value: 'nutri-asc', label: t('fridges.detail.sort.nutriAsc') },
                                    { value: 'nutri-desc', label: t('fridges.detail.sort.nutriDesc') },
                                    { value: 'expiry-asc', label: t('fridges.detail.sort.expiryAsc') },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                {t('fridges.detail.inventory')}
                            </h3>
                        </div>

                        {filteredAndSortedItems.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-4xl p-16 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                                    <ChefHat size={40} strokeWidth={1.5} />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mb-8">
                                    {items.length === 0 ? t('fridges.detail.emptyFridge') : t('fridges.detail.noResults')}
                                </p>
                                {items.length === 0 && (
                                    <Link href="/scanner">
                                        <Button variant="outline">
                                            {t('fridges.detail.startScanning')}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {sortedCategories.map(category => (
                                    <div key={category} className="space-y-3">
                                        <button
                                            onClick={() => toggleCategory(category)}
                                            className="w-full flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 border-b-4 border-slate-200 dark:border-slate-800 rounded-t-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-h-[48px]"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isCategoryExpanded(category) ? (
                                                    <ChevronDown size={20} className="text-slate-400" />
                                                ) : (
                                                    <ChevronRight size={20} className="text-slate-400" />
                                                )}
                                                <h4 className="font-bold text-slate-700 dark:text-slate-300">
                                                    {category}
                                                </h4>
                                                <span className="ml-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-0.5 px-2 rounded-full">
                                                    {groupedItems[category].length}
                                                </span>
                                            </div>
                                        </button>

                                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCategoryExpanded(category) ? 'opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-4 px-1 sm:px-2 relative">
                                                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 rounded-b-xl shadow-inner pointer-events-none -z-10" />

                                                {groupedItems[category].map((item) => (
                                                    <div key={item.id} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/60 transform transition-transform hover:-translate-y-1 hover:shadow-md group/item">

                                                        <div className="hidden md:flex absolute top-2 right-2 z-10 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setItemToDelete(item)
                                                                }}
                                                                className="p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full shadow-sm backdrop-blur-sm border border-slate-200 dark:border-slate-700 transition-colors"
                                                                title={t('fridges.detail.deleteProductTooltip')}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>

                                                        <div
                                                            className="absolute inset-y-0 right-0 w-20 flex items-center justify-center rounded-r-2xl bg-rose-500/95 text-white opacity-0 transition-opacity"
                                                            aria-hidden="true"
                                                        >
                                                            <div className="flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                                                                <Trash2 size={16} />
                                                                {t('fridges.detail.swipeDelete')}
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
                                                            className={`group p-3 cursor-pointer active:scale-[0.98] flex items-center gap-3 ${swipeItemId === item.id ? 'touch-none' : ''}`}
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
                                                                        {t('productModal.noImage')}
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
                                                                                {t('fridges.detail.saveQuantity')}
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
                                                                                {t('fridges.detail.cancelQuantity')}
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
                                                                                {t('fridges.detail.quantityLabel', { count: item.quantity ?? 1 })}
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
                                                                                        {t('fridges.detail.veganBadge')}
                                                                                    </span>
                                                                                )}
                                                                            {item.product.labels?.includes('Manuell') && (
                                                                                <span className="text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                                                    {t('fridges.detail.manualBadge')}
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedItem && (
                <ProductDetailModal
                    product={selectedItem.product}
                    quantity={selectedItem.quantity ?? 1}
                    itemId={selectedItem.id}
                    fridgeId={id}
                    onQuantityChange={async (itemId, fridgeId, quantity) => {
                        await updateItemQuantity(fridgeId, itemId, quantity)
                    }}
                    onDelete={async () => {
                        setSelectedItem(null)
                        setItemToDelete(selectedItem)
                    }}
                    onClose={() => setSelectedItem(null)}
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
                                        t('fridges.detail.deleteFridgeTypeConfirm')
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
                                    {t('fridges.detail.deleteFridgeWarning', { name: fridge.name })}
                                </p>
                                <Input
                                    type="text"
                                    value={deleteFridgeConfirm}
                                    onChange={(e) => setDeleteFridgeConfirm(e.target.value)}
                                    placeholder={t('fridges.detail.deleteFridgeConfirmText')}
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
                                        ? t('fridges.detail.deleteFridgeSubmitting')
                                        : t('fridges.detail.deleteFridgeSubmit')}
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t('fridges.detail.deleteProductTitle')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {t('fridges.detail.deleteProductConfirm', { name: itemToDelete.product.product_name })}
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
                                    await deleteFridgeItem(itemToDelete.id)
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
