'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/input'
import { AlertDialogCancel } from '@/components/ui/alert-dialog'
import {
    SettingsActionForm,
    SettingsActionModal,
} from '@/components/settings/SettingsAction'
import { useFirebaseAuth } from '@/components/auth/useFirebaseAuth'

interface DeleteAccountModalProps {
    usesPasswordProvider: boolean
    onClose: () => void
}

export function DeleteAccountModal({
    usesPasswordProvider,
    onClose,
}: DeleteAccountModalProps) {
    const router = useRouter()
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')
    const [status, setStatus] = useState('')
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { confirmation: '', currentPassword: '' },
    })
    const { deleteUserAccount, formatAuthError } = useFirebaseAuth()

    const onSubmit = handleSubmit(async (data) => {
        setStatus('')
        try {
            await deleteUserAccount(
                usesPasswordProvider ? data.currentPassword : undefined
            )
            onClose()
            router.push('/register')
        } catch (error) {
            setStatus(formatAuthError(error, t('delete.deleteFailed')))
        }
    })

    return (
        <SettingsActionModal
            isOpen
            onClose={() => {
                if (!isSubmitting) onClose()
            }}
            title={t('delete.title')}
            description={t('delete.warning')}
            danger
        >
            <SettingsActionForm
                onSubmit={onSubmit}
                danger
                noValidate
                className="space-y-4"
            >
                <FormField
                    label={t('delete.confirmText')}
                    required
                    error={errors.confirmation?.message}
                >
                    {(fieldProps) => (
                        <Input
                            {...fieldProps}
                            type="text"
                            {...register('confirmation', {
                                validate: (value) =>
                                    value === t('delete.confirmText') ||
                                    t('delete.typeDelete'),
                            })}
                            placeholder={t('delete.confirmText')}
                        />
                    )}
                </FormField>
                {usesPasswordProvider && (
                    <FormField
                        label={t('delete.currentPasswordPlaceholder')}
                        required
                        error={errors.currentPassword?.message}
                    >
                        {(fieldProps) => (
                            <Input
                                {...fieldProps}
                                type="password"
                                {...register('currentPassword', {
                                    validate: (value) =>
                                        !usesPasswordProvider ||
                                        !!value ||
                                        t('password.currentRequired'),
                                })}
                                placeholder={t(
                                    'delete.currentPasswordPlaceholder'
                                )}
                            />
                        )}
                    </FormField>
                )}
                {!usesPasswordProvider && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('delete.googleNote')}
                    </p>
                )}
                {status && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {status}
                    </p>
                )}
                <div className="flex gap-3 pt-2">
                    <AlertDialogCancel
                        type="button"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {tCommon('cancel')}
                    </AlertDialogCancel>
                    <Button
                        type="submit"
                        variant="outline"
                        disabled={isSubmitting}
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        {isSubmitting
                            ? t('delete.submitting')
                            : t('delete.submit')}
                    </Button>
                </div>
            </SettingsActionForm>
        </SettingsActionModal>
    )
}
