'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { deleteItem } from '@/lib/services/fridgeService'
import type { FridgeItem } from '@/lib/types'

interface DeleteProductDialogProps {
    fridgeId: string
    itemToDelete: FridgeItem
    onClose: () => void
}

export function DeleteProductDialog({
    fridgeId,
    itemToDelete,
    onClose,
}: DeleteProductDialogProps) {
    const t = useTranslations()
    const [deletingItem, setDeletingItem] = useState(false)

    return (
        <AlertDialog
            open={Boolean(itemToDelete)}
            onOpenChange={(open) => {
                if (!open && !deletingItem) onClose()
            }}
        >
            <AlertDialogContent className="flex flex-col gap-0 overflow-hidden rounded-3xl bg-card p-0 sm:max-w-sm">
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Trash2 size={32} />
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        {t('fridges.detail.deleteProductTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                        {t('fridges.detail.deleteProductConfirm', {
                            name: itemToDelete.product.product_name,
                        })}
                    </AlertDialogDescription>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                    <AlertDialogCancel
                        className="flex-1"
                        disabled={deletingItem}
                    >
                        {t('common.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-transparent"
                        disabled={deletingItem}
                        onClick={async (event) => {
                            event.preventDefault()
                            setDeletingItem(true)
                            try {
                                await deleteItem(fridgeId, itemToDelete.id!, {
                                    grade: itemToDelete.product
                                        .nutriscore_grade,
                                    quantity: itemToDelete.quantity ?? 1,
                                    itemName: itemToDelete.product.product_name,
                                })
                                onClose()
                            } catch {
                                // The service reports the error and allows a retry.
                            } finally {
                                setDeletingItem(false)
                            }
                        }}
                    >
                        {t('common.delete')}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
