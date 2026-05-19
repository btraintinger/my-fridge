'use client'

import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SettingsActionForm } from '@/components/settings/SettingsActionForm'
import { SettingsActionModal } from '@/components/settings/SettingsActionModal'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useSettingsStore } from '@/stores/settingsStore'

const DELETE_CONFIRMATION_TEXT = 'DELETE'

interface DeleteAccountModalProps {
    usesPasswordProvider: boolean
}

export function DeleteAccountModal({
    usesPasswordProvider,
}: DeleteAccountModalProps) {
    const router = useRouter()
    const isOpen = useSettingsStore((state) => state.activeDialog === 'delete')
    const deleteState = useSettingsStore((state) => state.deleteAccount)
    const closeDialog = useSettingsStore((state) => state.closeDialog)
    const setDeleteField = useSettingsStore((state) => state.setDeleteField)
    const setDeleteStatus = useSettingsStore((state) => state.setDeleteStatus)
    const setDeleteLoading = useSettingsStore((state) => state.setDeleteLoading)
    const { deleteUserAccount, formatAuthError } = useFirebaseAuth()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setDeleteStatus('')

        if (deleteState.confirmation !== DELETE_CONFIRMATION_TEXT) {
            setDeleteStatus('Type DELETE to confirm account deletion.')
            return
        }

        setDeleteLoading(true)

        try {
            await deleteUserAccount(
                usesPasswordProvider ? deleteState.currentPassword : undefined
            )
            router.push('/register')
        } catch (error) {
            setDeleteStatus(
                formatAuthError(
                    error,
                    'Could not delete account. Please try again.'
                )
            )
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <SettingsActionModal
            isOpen={isOpen}
            onClose={closeDialog}
            title="Delete Account"
            danger
        >
            <SettingsActionForm
                onSubmit={handleSubmit}
                danger
                className="space-y-4"
            >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    This action is permanent. Type DELETE to confirm.
                </p>
                <Input
                    type="text"
                    value={deleteState.confirmation}
                    onChange={(event) =>
                        setDeleteField('confirmation', event.target.value)
                    }
                    placeholder="DELETE"
                    required
                />
                {usesPasswordProvider && (
                    <Input
                        type="password"
                        value={deleteState.currentPassword}
                        onChange={(event) =>
                            setDeleteField(
                                'currentPassword',
                                event.target.value
                            )
                        }
                        placeholder="Current password"
                        required
                    />
                )}
                {!usesPasswordProvider && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        You will confirm this action in a Google popup.
                    </p>
                )}
                {deleteState.status && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {deleteState.status}
                    </p>
                )}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={closeDialog}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="outline"
                        disabled={deleteState.loading}
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        {deleteState.loading
                            ? 'Deleting account...'
                            : 'Delete Account'}
                    </Button>
                </div>
            </SettingsActionForm>
        </SettingsActionModal>
    )
}
