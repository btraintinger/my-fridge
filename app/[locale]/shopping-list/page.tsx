'use client'

import { PageShell, PageHeader } from '@/components/layout/Page'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

import { Spinner } from '@/components/feedback/Spinner'
import { EmptyState } from '@/components/feedback/States'
import { useTranslations } from 'next-intl'
import { useFridges } from '@/components/fridges/useFridges'
import { ShoppingCart } from 'lucide-react'
import { ScannerModal } from '@/components/scanner/ScannerModal'
import { ShoppingListItem } from '@/components/shopping-list/ShoppingListItem'
import { FridgeSelector } from '@/components/fridges/FridgeSelector'
import { AddItemForm } from '@/components/shopping-list/AddItemForm'
import { useShoppingList } from '@/components/shopping-list/useShoppingList'
import { useFridgeSelection } from '@/components/fridges/useFridgeSelection'

export default function ShoppingList() {
    const t = useTranslations('shoppingList')
    const { fridges } = useFridges()
    const { selectedFridge, setSelectedFridge } = useFridgeSelection(fridges)
    const {
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
    } = useShoppingList(selectedFridge)

    return (
        <PageShell>
            <PageHeader
                icon={ShoppingCart}
                title={t('title')}
                subtitle={t('subtitle')}
            />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div className="content-container max-w-2xl space-y-6 sm:space-y-8">
                    {movingItem && (
                        <Dialog open={movingItem}>
                            <DialogContent
                                aria-describedby={undefined}
                                showCloseButton={false}
                                onEscapeKeyDown={(event) =>
                                    event.preventDefault()
                                }
                                onInteractOutside={(event) =>
                                    event.preventDefault()
                                }
                                className="flex flex-col items-center gap-4 rounded-4xl bg-card p-8 sm:max-w-sm"
                            >
                                <Spinner className="w-12 h-12" />
                                <DialogTitle className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                                    {t('movingToFridge')}
                                </DialogTitle>
                            </DialogContent>
                        </Dialog>
                    )}

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                            {t('selectFridge')}
                        </h3>
                        <FridgeSelector
                            fridges={fridges}
                            selectedFridge={selectedFridge}
                            onSelect={setSelectedFridge}
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                            {t('quickAdd')}
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

                    {showLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner className="w-10 h-10" />
                        </div>
                    ) : visibleItems.length === 0 ? (
                        <EmptyState
                            size="lg"
                            icon={ShoppingCart}
                            title={t('emptyTitle')}
                            description={t('emptyMessage')}
                            className="animate-in fade-in zoom-in duration-500"
                        />
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {uncheckedItems.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                                        {t('toBuy')}
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
                                                onRename={renameItem}
                                                onUpdateDetails={
                                                    updateItemDetails
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {checkedItems.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
                                        {t('recentlyAdded')}
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
                                                onRename={renameItem}
                                                onUpdateDetails={
                                                    updateItemDetails
                                                }
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
        </PageShell>
    )
}
