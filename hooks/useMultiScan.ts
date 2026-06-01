import { useState, useCallback } from 'react'
import type { Product } from '@/lib/types'

export interface ScannedItem {
    barcode: string
    product?: Product
    quantity: number
    status: 'scanning' | 'success' | 'error' | 'duplicate'
    error?: string
    expiryDate?: string
}

export function useMultiScan() {
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])

    const addItem = useCallback((barcode: string) => {
        setScannedItems(prev => {
            const existing = prev.find(item => item.barcode === barcode)
            if (existing) return prev
            return [...prev, { barcode, quantity: 1, status: 'scanning' }]
        })
    }, [])

    const updateItem = useCallback((barcode: string, updates: Partial<ScannedItem>) => {
        setScannedItems(prev => prev.map(item => 
            item.barcode === barcode ? { ...item, ...updates } : item
        ))
    }, [])

    const updateQuantity = useCallback((barcode: string, quantity: number) => {
        setScannedItems(prev => prev.map(item => 
            item.barcode === barcode ? { ...item, quantity } : item
        ))
    }, [])

    const updateExpiryDate = useCallback((barcode: string, expiryDate: string) => {
        setScannedItems(prev => prev.map(item => 
            item.barcode === barcode ? { ...item, expiryDate } : item
        ))
    }, [])

    const removeItem = useCallback((barcode: string) => {
        setScannedItems(prev => prev.filter(item => item.barcode !== barcode))
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
        clearItems
    }
}
