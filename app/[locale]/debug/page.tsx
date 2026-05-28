'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { db } from '@/lib/firebase'
import {
    collection,
    getDocs,
    doc,
    query,
    where,
    deleteDoc
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { COLLECTIONS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function DebugPage() {
    const { user } = useAuth()
    const t = useTranslations('debug')
    const [status, setStatus] = useState<'idle' | 'deleting' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const clearDatabase = async () => {
        if (!user) {
            alert(t('mustBeLoggedIn'))
            return
        }

        if (!confirm(t('confirm'))) {
            return
        }

        setStatus('deleting')
        setMessage(t('deleteStarted'))

        try {
            const q = query(collection(db, COLLECTIONS.FRIDGES), where('userId', '==', user.uid))
            const fridgesSnap = await getDocs(q)
            const fridgeDocs = fridgesSnap.docs

            let deletedCount = 0

            for (const fridgeDoc of fridgeDocs) {
                const fridgeId = fridgeDoc.id

                const itemsSnap = await getDocs(collection(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.ITEMS))
                for (const itemDoc of itemsSnap.docs) {
                    await deleteDoc(doc(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.ITEMS, itemDoc.id))
                }

                const shoppingSnap = await getDocs(collection(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.SHOPPING_LIST))
                for (const shopDoc of shoppingSnap.docs) {
                    await deleteDoc(doc(db, COLLECTIONS.FRIDGES, fridgeId, COLLECTIONS.SHOPPING_LIST, shopDoc.id))
                }

                await deleteDoc(doc(db, COLLECTIONS.FRIDGES, fridgeId))
                deletedCount++
            }

            try {
                const productsSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS))
                for (const productDoc of productsSnap.docs) {
                    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productDoc.id))
                }
            } catch (cacheErr) {
                console.warn(t('cacheWarn'), cacheErr)
            }

            setStatus('success')
            setMessage(t('deleteSuccess', { count: deletedCount }))
        } catch (err: any) {
            console.error(err)
            setStatus('error')
            if (err?.code === 'permission-denied') {
                setMessage(t('permissionDenied'))
            } else {
                setMessage(t('genericFailure', { message: err?.message || t('unknownError') }))
            }
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl">
                        <AlertTriangle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {t('title')}
                    </h1>
                </div>

                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    {t('description')}
                </p>

                {status === 'idle' && (
                    <Button
                        variant="primary"
                        className="w-full bg-red-500 hover:bg-red-600 shadow-red-500/20"
                        onClick={clearDatabase}
                    >
                        <Trash2 size={20} className="mr-2" />
                        {t('deleteButton')}
                    </Button>
                )}

                {status === 'deleting' && (
                    <div className="flex flex-col items-center py-4">
                        <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {message}
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center py-4 animate-in zoom-in duration-300">
                        <CheckCircle2 size={40} className="text-emerald-500 mb-4" />
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-center mb-6">
                            {message}
                        </p>
                        <Link href="/fridges" className="w-full">
                            <Button variant="outline" className="w-full">
                                {t('backToApp')}
                            </Button>
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center py-4">
                        <AlertTriangle size={40} className="text-red-500 mb-4" />
                        <p className="text-red-600 font-bold text-center mb-6">
                            {message}
                        </p>
                        <Button variant="secondary" onClick={() => setStatus('idle')}>
                            {t('retry')}
                        </Button>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Link href="/fridges" className="text-sm text-slate-400 hover:text-emerald-500 transition-colors">
                        &larr; {t('cancel')}
                    </Link>
                </div>
            </div>
        </div>
    )
}
