'use client'

import { use, useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { calculateHealthScore } from '../../../lib/healthScore'
import { fridgeService } from '../../../lib/services/fridgeService'
import { useFridge } from '../../../hooks/useFridges'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import {
    NutriScoreBadge,
    NutriScoreDistribution,
} from '../../../components/fridge-details/NutriScoreComponents'
import { HealthScoreRing } from '../../../components/fridge-details/HealthScoreRing'
import { ProductDetailModal } from '../../../components/fridge-details/ProductDetailModal'
import Link from 'next/link'
import Image from 'next/image'
import {
    AlertCircle,
    ArrowLeft,
    ChefHat,
    Info,
    InfoIcon,
    ScanLine,
    Share2,
    Trash2,
    User,
    UserPlus,
    X,
} from 'lucide-react'
import type { FridgeItem } from '../../../lib/types'

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

    const healthScore = useMemo(() => calculateHealthScore(items), [items])

    const handleShare = async (e: React.SubmitEvent<HTMLFormElement>) => {
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

                {/* Health Score & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">
                            Health Score
                        </h3>
                        <HealthScoreRing score={healthScore.score} />
                        <div className="mt-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full">
                                <InfoIcon
                                    size={16}
                                    className="text-emerald-500"
                                />
                                <span>
                                    {items.length} Product
                                    {items.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">
                            Nutri-Score Spread
                        </h3>
                        <div className="flex-1 flex flex-col justify-center">
                            <NutriScoreDistribution items={items} />
                        </div>
                    </div>
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
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="group bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all cursor-pointer active:scale-[0.98] flex items-center gap-4"
                                >
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {item.product?.image_url ? (
                                            <Image
                                                src={item.product.image_url}
                                                alt={item.product.product_name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-300 dark:text-slate-600 p-1 text-center font-bold uppercase leading-tight">
                                                <ChefHat
                                                    size={20}
                                                    className="mb-1"
                                                />
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-slate-50 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {item.product.product_name}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                                            {item.product.brands ||
                                                'Unknown Brand'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <NutriScoreBadge
                                                grade={
                                                    item.product
                                                        ?.nutriscore_grade
                                                }
                                                size="sm"
                                            />
                                            {item.expiryDate && (
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                                    Exp:{' '}
                                                    {new Date(
                                                        item.expiryDate
                                                    ).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 dark:text-slate-600">
                                        <Info size={20} />
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
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    )
}
