'use client'

import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/input'
import { useState, type SubmitEvent } from 'react'
import { useRouter } from '@/i18n/navigation'
import { deleteFridge } from '@/lib/services/fridgeService'

interface DeleteFridgeDialogProps {
    fridgeName: string
    deletion: ReturnType<typeof useFridgeDeletion>
}

export function DeleteFridgeDialog({
    fridgeName,
    deletion,
}: DeleteFridgeDialogProps) {
    const t = useTranslations()
    const {
        showDeleteFridge,
        setShowDeleteFridge,
        deleteFridgeConfirm,
        setDeleteFridgeConfirm,
        deleteFridgeStatus,
        deletingFridge,
        handleDeleteFridge,
    } = deletion

    return (
        <AlertDialog
            open={showDeleteFridge}
            onOpenChange={(open) => {
                if (!deletingFridge) setShowDeleteFridge(open)
            }}
        >
            <AlertDialogContent className="flex flex-col gap-0 overflow-hidden rounded-3xl bg-card p-0 border-rose-100 dark:border-rose-900/50 sm:max-w-md">
                <form onSubmit={handleDeleteFridge} noValidate>
                    <div className="p-6 space-y-4">
                        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 size={32} />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-rose-600 dark:text-rose-400 text-center">
                            {t('fridges.detail.deleteFridgeTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 text-center">
                            {t('fridges.detail.deleteFridgeWarning', {
                                name: fridgeName,
                            })}
                        </AlertDialogDescription>
                        <FormField
                            label={t('fridges.detail.deleteFridgeConfirmText')}
                            required
                            error={deleteFridgeStatus || undefined}
                        >
                            {(fieldProps) => (
                                <Input
                                    {...fieldProps}
                                    type="text"
                                    value={deleteFridgeConfirm}
                                    onChange={(e) =>
                                        setDeleteFridgeConfirm(e.target.value)
                                    }
                                    placeholder={t(
                                        'fridges.detail.deleteFridgeConfirmText'
                                    )}
                                />
                            )}
                        </FormField>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                        <AlertDialogCancel
                            type="button"
                            className="flex-1"
                            disabled={deletingFridge}
                        >
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={deletingFridge}
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                            {deletingFridge
                                ? t('fridges.detail.deleteFridgeSubmitting')
                                : t('fridges.detail.deleteFridgeSubmit')}
                        </Button>
                    </div>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function useFridgeDeletion(id: string) {
    const t = useTranslations()
    const router = useRouter()
    const [showDeleteFridge, setShowDeleteFridge] = useState(false)
    const [deleteFridgeConfirm, setDeleteFridgeConfirm] = useState('')
    const [deleteFridgeStatus, setDeleteFridgeStatus] = useState('')
    const [deletingFridge, setDeletingFridge] = useState(false)

    const openDeleteFridge = () => {
        setDeleteFridgeConfirm('')
        setDeleteFridgeStatus('')
        setShowDeleteFridge(true)
    }

    const handleDeleteFridge = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setDeleteFridgeStatus('')
        if (
            deleteFridgeConfirm !== t('fridges.detail.deleteFridgeConfirmText')
        ) {
            setDeleteFridgeStatus(t('fridges.detail.deleteFridgeTypeConfirm'))
            return
        }
        setDeletingFridge(true)
        try {
            await deleteFridge(id)
            router.push('/fridges?list=1')
        } catch {
            setDeleteFridgeStatus(t('fridges.detail.deleteFridgeFailed'))
            setDeletingFridge(false)
        }
    }

    return {
        showDeleteFridge,
        setShowDeleteFridge,
        deleteFridgeConfirm,
        setDeleteFridgeConfirm,
        deleteFridgeStatus,
        deletingFridge,
        openDeleteFridge,
        handleDeleteFridge,
    }
}
