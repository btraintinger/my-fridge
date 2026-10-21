import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import {
    subscribeToFridge,
    subscribeToFridgeItems,
    subscribeToFridges,
} from '@/lib/services/fridgeService'
import type { Fridge, FridgeItem } from '@/lib/types'
import { useFirebaseSubscription } from '@/hooks/useFirebaseSubscription'

export function useFridges() {
    const { user } = useAuth()

    const { data: fridges, loading } = useFirebaseSubscription<Fridge[]>(
        (onData, onError) => {
            if (!user) return undefined
            return subscribeToFridges(
                { uid: user.uid, email: user.email },
                onData,
                (err) =>
                    err.code === 'permission-denied' ? onData([]) : onError(err)
            )
        },
        [user?.uid, user?.email]
    )

    if (!user) return { fridges: [], loading: false }
    return { fridges: fridges ?? [], loading }
}

export function useFridge(id: string) {
    const t = useTranslations('fridges.detail')
    const { user } = useAuth()
    const [fridge, setFridge] = useState<Fridge | null>(null)
    const [items, setItems] = useState<FridgeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<
        | ''
        | 'fridgeNotFound'
        | 'errors.accessDenied'
        | 'errors.loadFridge'
        | 'errors.loadItems'
    >('')

    useEffect(() => {
        if (!user || !id) return

        const unsubscribeFridge = subscribeToFridge(
            id,
            (data) => {
                if (!data) {
                    setError('fridgeNotFound')
                    setLoading(false)
                    return
                }

                const hasAccess =
                    data.userId === user.uid ||
                    (data.sharedWithEmails &&
                        Array.isArray(data.sharedWithEmails) &&
                        user.email &&
                        data.sharedWithEmails.includes(user.email))

                if (!hasAccess) {
                    setError('errors.accessDenied')
                    setLoading(false)
                    return
                }

                setFridge(data)
                setError('')
            },
            (err) => {
                if (err.code === 'permission-denied') return
                console.error('Error fetching fridge:', err)
                setError('errors.loadFridge')
                setLoading(false)
            }
        )

        const unsubscribeItems = subscribeToFridgeItems(
            id,
            (data) => {
                setItems(data)
                setLoading(false)
            },
            true,
            (err) => {
                if (err.code === 'permission-denied') return
                console.error('Error fetching items:', err)
                setError('errors.loadItems')
                setLoading(false)
            }
        )

        return () => {
            unsubscribeFridge()
            unsubscribeItems()
        }
    }, [user, id])

    if (!user || !id) {
        return { fridge: null, items: [], loading: false, error: '' }
    }

    return { fridge, items, loading, error: error ? t(error) : '' }
}
