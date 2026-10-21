import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { addItemToFridge } from '@/lib/services/fridgeService'
import {
    addShoppingItem,
    deleteShoppingItem,
    moveShoppingItemToFridge,
    subscribeToShoppingList,
    toggleShoppingItem,
    updateShoppingItemName,
    updateShoppingItemDetails,
} from '@/lib/services/shoppingListService'
import { getProduct } from '@/lib/services/productService'
import { createShoppingItemSchema } from '@/lib/validations'
import { notify } from '@/lib/notify'
import type { ShoppingListItem as ShoppingListItemType } from '@/lib/types'

export function useShoppingList(selectedFridge: string) {
    const { user } = useAuth()
    const tAll = useTranslations()
    const schema = useMemo(() => createShoppingItemSchema(tAll), [tAll])
    const [items, setItems] = useState<ShoppingListItemType[]>([])
    const [newItem, setNewItem] = useState('')
    const [loadedFridge, setLoadedFridge] = useState<string | null>(null)
    const [loadError, setLoadError] = useState(false)
    const [scannerOpen, setScannerOpen] = useState(false)
    const [scanningItemId, setScanningItemId] = useState<string | null>(null)
    const [movingItem, setMovingItem] = useState(false)

    useEffect(() => {
        if (!user || !selectedFridge) return

        const unsubscribe = subscribeToShoppingList(
            selectedFridge,
            (data) => {
                setItems(data)
                setLoadedFridge(selectedFridge)
            },
            (err) => {
                if (err.code === 'permission-denied') return
                console.error('Error fetching shopping list:', err)
                setLoadError(true)
            }
        )

        return () => unsubscribe()
    }, [user, selectedFridge])

    const hasActiveList = Boolean(user && selectedFridge)
    const visibleItems = hasActiveList ? items : []
    const showLoading =
        hasActiveList && !loadError && loadedFridge !== selectedFridge

    const handleAddItem = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!user || !selectedFridge) return

        const parsed = schema.safeParse({ name: newItem })
        if (!parsed.success) {
            notify.error(parsed.error.issues[0].message)
            return
        }

        await addShoppingItem(selectedFridge, user.uid, parsed.data.name)
        setNewItem('')
    }

    const toggleItem = async (itemId: string, checked: boolean) => {
        const item = items.find((i) => i.id === itemId)
        await toggleShoppingItem(
            selectedFridge,
            itemId,
            checked,
            item?.name ?? ''
        )
    }

    const deleteItem = async (itemId: string) => {
        const item = items.find((i) => i.id === itemId)
        await deleteShoppingItem(selectedFridge, itemId, item?.name ?? '')
    }

    const renameItem = async (itemId: string, name: string) => {
        await updateShoppingItemName(selectedFridge, itemId, name)
    }

    const updateItemDetails = async (
        itemId: string,
        details: { quantity?: number; unit?: string }
    ) => {
        await updateShoppingItemDetails(selectedFridge, itemId, details)
    }

    const handleScan = async (barcode: string) => {
        if (!user || !selectedFridge) return

        setMovingItem(true)
        try {
            const product = await getProduct(barcode)
            if (!product) {
                return
            }

            if (scanningItemId) {
                await moveShoppingItemToFridge(
                    selectedFridge,
                    scanningItemId,
                    product
                )
            } else {
                const match = items.find(
                    (i) =>
                        i.name.toLowerCase() ===
                            product!.product_name.toLowerCase() ||
                        product!.product_name
                            .toLowerCase()
                            .includes(i.name.toLowerCase())
                )
                if (match) {
                    await moveShoppingItemToFridge(
                        selectedFridge,
                        match.id!,
                        product
                    )
                } else {
                    await addItemToFridge(selectedFridge, product)
                }
            }

            setScanningItemId(null)
        } finally {
            setMovingItem(false)
        }
    }

    const uncheckedItems = visibleItems.filter((i) => !i.checked)
    const checkedItems = visibleItems.filter((i) => i.checked)
    return {
        visibleItems,
        uncheckedItems,
        checkedItems,
        newItem,
        setNewItem,
        showLoading,
        scannerOpen,
        setScannerOpen,
        setScanningItemId,
        movingItem,
        handleAddItem,
        toggleItem,
        deleteItem,
        renameItem,
        updateItemDetails,
        handleScan,
    }
}
