'use client'

import type { FormEvent } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SettingsActionForm } from '@/components/settings/SettingsActionForm'
import { SettingsActionModal } from '@/components/settings/SettingsActionModal'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useSettingsStore } from '@/stores/settingsStore'

interface DeleteAccountModalProps {
    usesPasswordProvider: boolean
}

export function DeleteAccountModal({
    usesPasswordProvider,
}: DeleteAccountModalProps) {
    const router = useRouter()
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')
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

        if (deleteState.confirmation !== t('delete.confirmText')) {
            setDeleteStatus(t('delete.typeDelete'))
            return
        }

        setDeleteLoading(true)

        try {
            await deleteUserAccount(
                usesPasswordProvider ? deleteState.currentPassword : undefined
            )
            router.push('/register')
        } catch (error) {
            setDeleteStatus(formatAuthError(error, t('delete.deleteFailed')))
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <SettingsActionModal
            isOpen={isOpen}
            onClose={closeDialog}
            title={t('delete.title')}
            danger
        >
            <SettingsActionForm
                onSubmit={handleSubmit}
                danger
                className="space-y-4"
            >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('delete.warning')}
                </p>
                <Input
                    type="text"
                    value={deleteState.confirmation}
                    onChange={(event) =>
                        setDeleteField('confirmation', event.target.value)
                    }
                    placeholder={t('delete.confirmText')}
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
                        placeholder={t('delete.currentPasswordPlaceholder')}
                        required
                    />
                )}
                {!usesPasswordProvider && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('delete.googleNote')}
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
                        {tCommon('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="outline"
                        disabled={deleteState.loading}
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        {deleteState.loading
                            ? t('delete.submitting')
                            : t('delete.submit')}
                    </Button>
                </div>
            </SettingsActionForm>
        </SettingsActionModal>
    )
}
