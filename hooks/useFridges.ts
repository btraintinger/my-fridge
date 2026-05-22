import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
    subscribeToFridge,
    subscribeToFridgeItems,
    subscribeToFridges,
} from '../lib/services/fridgeService'
import { modalNutriScore } from '../lib/utils'
import type { Fridge, FridgeItem } from '../lib/types'

export function useFridges() {
    const { user } = useAuth()
    const [fridges, setFridges] = useState<Fridge[]>([])
    const [loading, setLoading] = useState(true)
    const [fridgeScores, setFridgeScores] = useState<
        Record<string, string | null>
    >({})

    useEffect(() => {
        if (!user) return

        const unsubscribe = subscribeToFridges(
            { uid: user.uid, email: user.email },
            (data) => {
                setFridges(data)
                setLoading(false)
            },
            (err) => {
                if (err.code === 'permission-denied') {
                    setFridges([])
                    setLoading(false)
                    return
                }
                console.error('Error fetching fridges:', err)
                setLoading(false)
            }
        )

        return () => unsubscribe()
    }, [user])

    // Subscribe to Nutri-Scores for all fridges
    useEffect(() => {
        if (fridges.length === 0) return

        const unsubscribes: (() => void)[] = []

        fridges.forEach((fridge) => {
            const unsub = subscribeToFridgeItems(
                fridge.id,
                (items) => {
                    const grades = items.map(
                        (i) =>
                            (i.product?.nutriscore_grade as string | null) ??
                            null
                    )
                    setFridgeScores((prev) => ({
                        ...prev,
                        [fridge.id]: modalNutriScore(grades),
                    }))
                },
                false,
                (err) => {
                    if (err.code === 'permission-denied') return
                    console.error(
                        `Error fetching items for fridge ${fridge.id}:`,
                        err
                    )
                }
            )
            unsubscribes.push(unsub)
        })

        return () => unsubscribes.forEach((unsub) => unsub())
    }, [fridges])

    if (!user) {
        return { fridges: [], fridgeScores: {}, loading: false }
    }

    return { fridges, fridgeScores, loading }
}

export function useFridge(id: string) {
    const { user } = useAuth()
    const [fridge, setFridge] = useState<Fridge | null>(null)
    const [items, setItems] = useState<FridgeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user || !id) return

        const unsubscribeFridge = subscribeToFridge(
            id,
            (data) => {
                if (!data) {
                    setError('Fridge not found.')
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
                    setError('Access denied.')
                    setLoading(false)
                    return
                }

                setFridge(data)
                setError('')
            },
            (err) => {
                if (err.code === 'permission-denied') return
                console.error('Error fetching fridge:', err)
                setError('Failed to load fridge.')
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
                setError('Failed to load items.')
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

    return { fridge, items, loading, error }
}
