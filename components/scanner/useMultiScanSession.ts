import { useState, useCallback, useRef } from 'react'
import type { Product } from '@/lib/types'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { getProduct } from '@/lib/services/productService'
import { addItemToFridge } from '@/lib/services/fridgeService'
import { notify } from '@/lib/notify'

export interface ScannedItem {
    barcode: string
    product?: Product
    quantity: number
    status: 'scanning' | 'success' | 'error' | 'duplicate'
    error?: string
    expiryDate?: string
}

function useMultiScan() {
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])

    const addItem = useCallback((barcode: string) => {
        setScannedItems((prev) => {
            const existing = prev.find((item) => item.barcode === barcode)
            if (existing) return prev
            return [...prev, { barcode, quantity: 1, status: 'scanning' }]
        })
    }, [])

    const updateItem = useCallback(
        (barcode: string, updates: Partial<ScannedItem>) => {
            setScannedItems((prev) =>
                prev.map((item) =>
                    item.barcode === barcode ? { ...item, ...updates } : item
                )
            )
        },
        []
    )

    const updateQuantity = useCallback((barcode: string, quantity: number) => {
        setScannedItems((prev) =>
            prev.map((item) =>
                item.barcode === barcode ? { ...item, quantity } : item
            )
        )
    }, [])

    const updateExpiryDate = useCallback(
        (barcode: string, expiryDate: string) => {
            setScannedItems((prev) =>
                prev.map((item) =>
                    item.barcode === barcode ? { ...item, expiryDate } : item
                )
            )
        },
        []
    )

    const removeItem = useCallback((barcode: string) => {
        setScannedItems((prev) =>
            prev.filter((item) => item.barcode !== barcode)
        )
    }, [])

    const clearItems = useCallback(() => {
        setScannedItems([])
    }, [])

    return {
        scannedItems,
        addItem,
        updateItem,
        updateQuantity,
        updateExpiryDate,
        removeItem,
        clearItems,
    }
}

export function useMultiScanSession(onComplete: () => void) {
    const t = useTranslations()
    const { user } = useAuth()
    const [isAddingMulti, setIsAddingMulti] = useState(false)
    const processingBarcodesRef = useRef<Set<string>>(new Set())

    const {
        scannedItems,
        addItem,
        updateItem,
        updateQuantity,
        updateExpiryDate,
        removeItem,
        clearItems,
    } = useMultiScan()

    const scan = useCallback(
        async (trimmedCode: string) => {
            if (processingBarcodesRef.current.has(trimmedCode)) return

            const existing = scannedItems.find((i) => i.barcode === trimmedCode)
            if (existing) {
                if (existing.status === 'success') {
                    updateQuantity(trimmedCode, existing.quantity + 1)
                    notify.success(
                        t('scanner.scanQuantityAdded', {
                            name: existing.product?.product_name || trimmedCode,
                            quantity: existing.quantity + 1,
                        })
                    )
                } else if (existing.status === 'error') {
                    notify.error(t('scanner.errors.notFound'))
                }
                return
            }

            processingBarcodesRef.current.add(trimmedCode)
            addItem(trimmedCode)
            try {
                const prod = await getProduct(trimmedCode)

                if (prod) {
                    updateItem(trimmedCode, {
                        product: prod,
                        status: 'success',
                    })
                    notify.success(
                        t('scanner.scanAdded', {
                            name: prod.product_name || trimmedCode,
                        })
                    )
                } else {
                    updateItem(trimmedCode, {
                        status: 'error',
                        error: t('scanner.errors.notFound'),
                    })
                    notify.error(t('scanner.errors.notFound'))
                }
            } catch {
                updateItem(trimmedCode, {
                    status: 'error',
                    error: t('scanner.errors.searchFailed'),
                })
                notify.error(t('scanner.errors.searchFailed'))
            } finally {
                processingBarcodesRef.current.delete(trimmedCode)
            }
            return
        },
        [scannedItems, updateQuantity, t, addItem, updateItem]
    )

    const handleAddAllMulti = async (fridgeId: string) => {
        if (!user || isAddingMulti) return
        setIsAddingMulti(true)
        try {
            const successItems = scannedItems.filter(
                (i) => i.status === 'success' && i.product
            )
            for (const item of successItems) {
                await addItemToFridge(fridgeId, item.product!, {
                    quantity: item.quantity,
                    expiryDate: item.expiryDate,
                })
            }
            notify.success(t('scanner.addedToFridge'))
            clearItems()
            onComplete()
        } catch {
            notify.error(t('scanner.errors.addFailed'))
        } finally {
            setIsAddingMulti(false)
        }
    }

    return {
        scannedItems,
        addItem,
        updateItem,
        updateQuantity,
        updateExpiryDate,
        removeItem,
        clearItems,
        isAddingMulti,
        scan,
        addAll: handleAddAllMulti,
    }
}
