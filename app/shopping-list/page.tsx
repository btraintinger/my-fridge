'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fridgeService, productService } from '@/lib/services/fridgeService'
import { useFridges } from '@/hooks/useFridges'
import { fetchProductByBarcode } from '@/lib/openFoodFacts'
import { ShoppingCart } from 'lucide-react'
import { ScannerModal } from '@/components/ScannerModal'
import { ShoppingListItem } from '@/components/shopping-list/ShoppingListItem'
import { FridgeSelector } from '@/components/shopping-list/FridgeSelector'
import { AddItemForm } from '@/components/shopping-list/AddItemForm'
import type {
    Fridge,
    Product,
    ShoppingListItem as ShoppingListItemType,
} from '../../lib/types'

export default function ShoppingList() {
    const { user } = useAuth()
    const { fridges: userFridges } = useFridges()
    const [fridges, setFridges] = useState<Fridge[]>([])
    const [selectedFridge, setSelectedFridge] = useState('')
    const [items, setItems] = useState<ShoppingListItemType[]>([])
    const [newItem, setNewItem] = useState('')
    const [loading, setLoading] = useState(true)
    const [scannerOpen, setScannerOpen] = useState(false)
    const [scanningItemId, setScanningItemId] = useState<string | null>(null)
    const [movingItem, setMovingItem] = useState(false)

    // Update fridges from hook
    useEffect(() => {
        setFridges(userFridges)
        if (userFridges.length > 0 && !selectedFridge)
            setSelectedFridge(userFridges[0].id)
    }, [userFridges, selectedFridge])

    // Fetch shopping list items when fridge changes
    useEffect(() => {
        if (!user || !selectedFridge) {
            setLoading(false)
            setItems([])
            return
        }

        setLoading(true)
        const unsubscribe = fridgeService.subscribeToShoppingList(
            selectedFridge,
            (data) => {
                setItems(data)
                setLoading(false)
            },
            (err) => {
                if (err.code === 'permission-denied') return
                console.error('Error fetching shopping list:', err)
                setLoading(false)
            }
        )

        return () => unsubscribe()
    }, [user, selectedFridge])

    const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!user || !newItem.trim() || !selectedFridge) return

        await fridgeService.addShoppingItem(selectedFridge, user.uid, newItem)
        setNewItem('')
    }

    const toggleItem = async (itemId: string, checked: boolean) => {
        await fridgeService.toggleShoppingItem(selectedFridge, itemId, checked)
    }

    const deleteItem = async (itemId: string) => {
        await fridgeService.deleteShoppingItem(selectedFridge, itemId)
    }

    const handleScan = async (barcode: string) => {
        if (!user || !selectedFridge) return

        setMovingItem(true)
        try {
            let product: Product | null = null

            // Check cache first
            product = await productService.getCachedProduct(barcode)

            if (!product) {
                product = await fetchProductByBarcode(barcode)
                if (product) {
                    // Save to cache
                    await productService.cacheProduct(barcode, product)
                }
            }

            if (!product) {
                return
            }

            // Move item to fridge
            if (scanningItemId) {
                await fridgeService.moveShoppingItemToFridge(
                    selectedFridge,
                    scanningItemId,
                    product
                )
            } else {
                // If it was a general scan, try to find a matching item by name
                const match = items.find(
                    (i) =>
                        i.name.toLowerCase() ===
                            product!.product_name.toLowerCase() ||
                        product!.product_name
                            .toLowerCase()
                            .includes(i.name.toLowerCase())
                )
                if (match) {
                    await fridgeService.moveShoppingItemToFridge(
                        selectedFridge,
                        match.id,
                        product
                    )
                } else {
                    // Just add it to the fridge anyway
                    await fridgeService.addItemToFridge(selectedFridge, product)
                }
            }

            setScanningItemId(null)
        } finally {
            setMovingItem(false)
        }
    }

    const uncheckedItems = items.filter((i) => !i.checked)
    const checkedItems = items.filter((i) => i.checked)

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-6 lg:pl-20 xl:pl-56">
            <div className="pt-safe">
            <div className="pt-12 px-4 sm:px-6 lg:px-8 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                    Shopping List
                </h1>
            </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div className="content-container max-w-2xl space-y-6 sm:space-y-8">
                {/* Moving Item Loading */}
                {movingItem && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                            <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                                Moving to fridge...
                            </p>
                        </div>
                    </div>
                )}

                {/* Fridge Selector */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                        Select Fridge
                    </h3>
                    <FridgeSelector
                        fridges={fridges}
                        selectedFridge={selectedFridge}
                        onSelect={setSelectedFridge}
                    />
                </div>

                {/* Add Item */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                        Quick Add
                    </h3>
                    <AddItemForm
                        newItem={newItem}
                        setNewItem={setNewItem}
                        onAdd={handleAddItem}
                        onOpenScanner={() => {
                            setScanningItemId(null)
                            setScannerOpen(true)
                        }}
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
                            <ShoppingCart size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                            List is empty
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                            Add items you need to buy above.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Unchecked Items */}
                        {uncheckedItems.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                                    To Buy
                                </h3>
                                <div className="grid gap-3">
                                    {uncheckedItems.map((item) => (
                                        <ShoppingListItem
                                            key={item.id}
                                            item={item}
                                            onToggle={toggleItem}
                                            onScan={(id) => {
                                                setScanningItemId(id)
                                                setScannerOpen(true)
                                            }}
                                            onDelete={deleteItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Checked Items */}
                        {checkedItems.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                                    Recently Added
                                </h3>
                                <div className="grid gap-3 opacity-80">
                                    {checkedItems.map((item) => (
                                        <ShoppingListItem
                                            key={item.id}
                                            item={item}
                                            onToggle={toggleItem}
                                            onScan={(id) => {
                                                setScanningItemId(id)
                                                setScannerOpen(true)
                                            }}
                                            onDelete={deleteItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
            <ScannerModal
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleScan}
            />
        </div>
    )
}
