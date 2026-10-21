'use client'

import { PageShell, PageHeader } from '@/components/layout/Page'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { addItemToFridge } from '@/lib/services/fridgeService'
import { useFridges } from '@/components/fridges/useFridges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/feedback/Spinner'
import { Camera, Search } from 'lucide-react'
import { ScannerModal } from '@/components/scanner/ScannerModal'
import { ScannedProductsList } from '@/components/scanner/ScannedProductsList'
import { useProductLookup } from '@/components/scanner/useProductLookup'
import { useMultiScanSession } from '@/components/scanner/useMultiScanSession'
import { ManualProductModal } from '@/components/products/manual/ManualProductModal'
import { ScanModeButtons } from '@/components/scanner/ScanModeButtons'
import { SingleScanResult } from '@/components/scanner/SingleScanResult'
import type { Product } from '@/lib/types'
import { useProductWarnings } from '@/components/products/useProductWarnings'
import { useFridgeSelection } from '@/components/fridges/useFridgeSelection'

export default function Scanner() {
    const t = useTranslations()
    const { user } = useAuth()
    const [scannerOpen, setScannerOpen] = useState(false)
    const [manualModalOpen, setManualModalOpen] = useState(false)
    const [scanMode, setScanMode] = useState<
        'single' | 'multi' | 'multi-review'
    >('single')
    const {
        barcode,
        setBarcode,
        product,
        setProduct,
        expiryDate,
        setExpiryDate,
        searching,
        added,
        setAdded,
        search,
    } = useProductLookup()
    const {
        scannedItems,
        addItem,
        updateItem,
        updateQuantity,
        updateExpiryDate,
        removeItem,
        clearItems,
        isAddingMulti,
        scan,
        addAll,
    } = useMultiScanSession(() => setScanMode('single'))

    const { fridges } = useFridges()
    const { selectedFridge, setSelectedFridge } = useFridgeSelection(fridges)
    const { warnings, allergenLabels } = useProductWarnings(product)

    const handleSearch = async (code: string) => {
        const trimmedCode = code.trim()
        if (!trimmedCode) return
        if (scanMode === 'multi') {
            await scan(trimmedCode)
        } else {
            await search(trimmedCode)
        }
    }

    const handleAddToFridge = async () => {
        if (!user || !product || !selectedFridge) return

        await addItemToFridge(selectedFridge, product, { expiryDate })
        setAdded(true)
        setExpiryDate('')
    }

    const handleManualSubmit = async (
        manualProduct: Product,
        options: { quantity: number; expiryDate?: string; notes?: string }
    ) => {
        if (!user || !selectedFridge) return

        if (scanMode === 'multi-review') {
            addItem(manualProduct.barcode)
            updateItem(manualProduct.barcode, {
                product: manualProduct,
                status: 'success',
                quantity: options.quantity || 1,
            })
            setManualModalOpen(false)
            return
        }

        await addItemToFridge(selectedFridge, manualProduct, options)

        setProduct(manualProduct)
        setAdded(true)
    }

    return (
        <PageShell>
            <PageHeader
                icon={Camera}
                title={t('scanner.title')}
                subtitle={t('scanner.subtitle')}
            />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {scanMode === 'multi-review' ? (
                    <ScannedProductsList
                        items={scannedItems}
                        onUpdateQuantity={updateQuantity}
                        onUpdateExpiryDate={updateExpiryDate}
                        onRemove={removeItem}
                        onAddAll={addAll}
                        isAdding={isAddingMulti}
                        onAddManual={() => setManualModalOpen(true)}
                        onCancel={() => {
                            clearItems()
                            setScanMode('single')
                        }}
                    />
                ) : (
                    <div className="content-container max-w-2xl space-y-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSearch(barcode)
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                placeholder={t('scanner.barcodePlaceholder')}
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={searching}>
                                <Search size={20} />
                            </Button>
                        </form>

                        <ScanModeButtons
                            onSingleScan={() => {
                                setScanMode('single')
                                setScannerOpen(true)
                            }}
                            onMultiScan={() => {
                                setScanMode('multi')
                                setScannerOpen(true)
                            }}
                            onManual={() => setManualModalOpen(true)}
                        />

                        {searching && (
                            <div className="flex items-center justify-center py-12">
                                <Spinner size="md" />
                            </div>
                        )}

                        {product && (
                            <SingleScanResult
                                product={product}
                                expiryDate={expiryDate}
                                onExpiryDateChange={setExpiryDate}
                                fridges={fridges}
                                selectedFridge={selectedFridge}
                                onFridgeChange={setSelectedFridge}
                                added={added}
                                warnings={warnings}
                                allergenLabels={allergenLabels}
                                onAddToFridge={handleAddToFridge}
                            />
                        )}
                    </div>
                )}
            </div>
            <ScannerModal
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleSearch}
                isMultiScan={scanMode === 'multi'}
                scannedCount={scannedItems.length}
                onComplete={() => {
                    setScannerOpen(false)
                    setScanMode('multi-review')
                }}
            />
            {manualModalOpen && (
                <ManualProductModal
                    onClose={() => setManualModalOpen(false)}
                    onSubmit={handleManualSubmit}
                />
            )}
        </PageShell>
    )
}
