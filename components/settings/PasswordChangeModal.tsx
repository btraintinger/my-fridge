'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/FormField'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    SettingsActionForm,
    SettingsActionModal,
} from '@/components/settings/SettingsAction'
import { useFirebaseAuth } from '@/components/auth/useFirebaseAuth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPasswordChangeSchema } from '@/lib/validations'

interface PasswordChangeModalProps {
    onClose: () => void
    onSuccess: (message: string) => void
}

export const PasswordChangeModal = ({
    onClose,
    onSuccess,
}: PasswordChangeModalProps) => {
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')
    const { updateUserPassword, formatAuthError } = useFirebaseAuth()
    const [status, setStatus] = useState('')
    const schema = useMemo(() => createPasswordChangeSchema(t), [t])
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            newPassword: '',
            confirmNewPassword: '',
            currentPassword: '',
        },
    })

    const handleClose = () => {
        if (!isSubmitting) onClose()
    }

    const onSubmit = handleSubmit(async (data) => {
        setStatus('')
        try {
            await updateUserPassword(data.currentPassword, data.newPassword)
            onSuccess(t('password.updated'))
            onClose()
        } catch (error) {
            setStatus(formatAuthError(error, t('password.updateFailed')))
        }
    })

    return (
        <SettingsActionModal
            isOpen
            onClose={handleClose}
            title={t('password.title')}
        >
            <SettingsActionForm
                onSubmit={onSubmit}
                noValidate
                className="space-y-4"
            >
                <FormField
                    label={t('password.newPlaceholder')}
                    required
                    error={errors.newPassword?.message}
                >
                    {(fieldProps) => (
                        <Input
                            {...fieldProps}
                            {...register('newPassword')}
                            type="password"
                            autoComplete="new-password"
                            placeholder={t('password.newPlaceholder')}
                            required
                            minLength={6}
                        />
                    )}
                </FormField>
                <FormField
                    label={t('password.confirmPlaceholder')}
                    required
                    error={errors.confirmNewPassword?.message}
                >
                    {(fieldProps) => (
                        <Input
                            {...fieldProps}
                            {...register('confirmNewPassword')}
                            type="password"
                            autoComplete="new-password"
                            placeholder={t('password.confirmPlaceholder')}
                            required
                            minLength={6}
                        />
                    )}
                </FormField>
                <FormField
                    label={t('password.currentPlaceholder')}
                    required
                    error={errors.currentPassword?.message}
                >
                    {(fieldProps) => (
                        <Input
                            {...fieldProps}
                            {...register('currentPassword')}
                            type="password"
                            autoComplete="current-password"
                            placeholder={t('password.currentPlaceholder')}
                            required
                        />
                    )}
                </FormField>
                {status && (
                    <Alert variant="destructive">
                        <AlertDescription>{status}</AlertDescription>
                    </Alert>
                )}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        {tCommon('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? t('password.submitting')
                            : t('password.submit')}
                    </Button>
                </div>
            </SettingsActionForm>
        </SettingsActionModal>
    )
}

PasswordChangeModal.displayName = 'PasswordChangeModal'
