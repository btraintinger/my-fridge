'use client'

import type { FormEvent } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SettingsActionForm } from '@/components/settings/SettingsActionForm'
import { SettingsActionModal } from '@/components/settings/SettingsActionModal'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useSettingsStore } from '@/stores/settingsStore'

export const PasswordChangeModal = () => {
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')
    const isOpen = useSettingsStore(
        (state) => state.activeDialog === 'password'
    )
    const passwordState = useSettingsStore((state) => state.password)
    const closeDialog = useSettingsStore((state) => state.closeDialog)
    const setPasswordField = useSettingsStore((state) => state.setPasswordField)
    const setPasswordStatus = useSettingsStore(
        (state) => state.setPasswordStatus
    )
    const setPasswordLoading = useSettingsStore(
        (state) => state.setPasswordLoading
    )
    const resetPassword = useSettingsStore((state) => state.resetPassword)
    const { updateUserPassword, formatAuthError } = useFirebaseAuth()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setPasswordStatus('')

        if (passwordState.newPassword !== passwordState.confirmNewPassword) {
            setPasswordStatus(t('password.mismatch'))
            return
        }

        if (passwordState.newPassword.length < 6) {
            setPasswordStatus(t('password.tooShort'))
            return
        }

        setPasswordLoading(true)

        try {
            await updateUserPassword(
                passwordState.currentPassword,
                passwordState.newPassword
            )
            resetPassword(t('password.updated'))
            closeDialog()
        } catch (error) {
            setPasswordStatus(
                formatAuthError(error, t('password.updateFailed'))
            )
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <SettingsActionModal
            isOpen={isOpen}
            onClose={closeDialog}
            title={t('password.title')}
        >
            <SettingsActionForm onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="password"
                    value={passwordState.newPassword}
                    onChange={(event) =>
                        setPasswordField('newPassword', event.target.value)
                    }
                    placeholder={t('password.newPlaceholder')}
                    required
                    minLength={6}
                />
                <Input
                    type="password"
                    value={passwordState.confirmNewPassword}
                    onChange={(event) =>
                        setPasswordField(
                            'confirmNewPassword',
                            event.target.value
                        )
                    }
                    placeholder={t('password.confirmPlaceholder')}
                    required
                    minLength={6}
                />
                <Input
                    type="password"
                    value={passwordState.currentPassword}
                    onChange={(event) =>
                        setPasswordField('currentPassword', event.target.value)
                    }
                    placeholder={t('password.currentPlaceholder')}
                    required
                />
                {passwordState.status && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {passwordState.status}
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
                        className="flex-1"
                        disabled={passwordState.loading}
                    >
                        {passwordState.loading
                            ? t('password.submitting')
                            : t('password.submit')}
                    </Button>
                </div>
            </SettingsActionForm>
        </SettingsActionModal>
    )
}

PasswordChangeModal.displayName = 'PasswordChangeModal'
