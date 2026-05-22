'use client'

import type { FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SettingsActionForm } from '@/components/settings/SettingsActionForm'
import { SettingsActionModal } from '@/components/settings/SettingsActionModal'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useSettingsStore } from '@/stores/settingsStore'

export const PasswordChangeModal = () => {
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
            setPasswordStatus('Passwords must match.')
            return
        }

        if (passwordState.newPassword.length < 6) {
            setPasswordStatus(
                'Your new password must be at least 6 characters.'
            )
            return
        }

        setPasswordLoading(true)

        try {
            await updateUserPassword(
                passwordState.currentPassword,
                passwordState.newPassword
            )
            resetPassword('Password updated successfully.')
            closeDialog()
        } catch (error) {
            setPasswordStatus(
                formatAuthError(
                    error,
                    'Could not update password. Please try again.'
                )
            )
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <SettingsActionModal
            isOpen={isOpen}
            onClose={closeDialog}
            title="Change Password"
        >
            <SettingsActionForm onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="password"
                    value={passwordState.newPassword}
                    onChange={(event) =>
                        setPasswordField('newPassword', event.target.value)
                    }
                    placeholder="New password"
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
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                />
                <Input
                    type="password"
                    value={passwordState.currentPassword}
                    onChange={(event) =>
                        setPasswordField('currentPassword', event.target.value)
                    }
                    placeholder="Current password"
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
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={passwordState.loading}
                    >
                        {passwordState.loading
                            ? 'Updating password...'
                            : 'Change Password'}
                    </Button>
                </div>
            </SettingsActionForm>
        </SettingsActionModal>
    )
}

PasswordChangeModal.displayName = 'PasswordChangeModal'
