'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/forms/FormField'
import { Select } from '@/components/forms/SelectField'
import { DatePicker } from '@/components/forms/DatePicker'
import { QuantityStepper } from '@/components/forms/QuantityStepper'
import { useManualProductForm } from '@/components/products/manual/useManualProductForm'
import { NutrimentSection } from '@/components/products/manual/NutrimentSection'
import type { Product } from '@/lib/types'

interface ManualProductModalProps {
    onClose: () => void
    onSubmit: (
        product: Product,
        options: { quantity: number; expiryDate?: string; notes?: string }
    ) => Promise<void>
}

export function ManualProductModal({
    onClose,
    onSubmit,
}: ManualProductModalProps) {
    const t = useTranslations()
    const [showAdvanced, setShowAdvanced] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting, isValid },
        onFormSubmit,
        CATEGORIES,
    } = useManualProductForm({ onSubmit, onClose })

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent
                aria-describedby={undefined}
                className="bottom-0 top-auto left-0 flex max-h-[90dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-3xl rounded-b-none bg-card p-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:max-w-md"
            >
                <div className="flex justify-between items-center p-4 pr-14 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        {t('manualProduct.title')}
                    </DialogTitle>
                </div>
                <form
                    noValidate
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-5"
                >
                    <FormField
                        label={t('manualProduct.nameLabel')}
                        required
                        error={errors.name?.message}
                    >
                        {(fieldProps) => (
                            <Input
                                {...fieldProps}
                                placeholder={t('manualProduct.namePlaceholder')}
                                aria-invalid={!!errors.name}
                                className="h-12"
                                {...register('name')}
                            />
                        )}
                    </FormField>

                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                        <FormField
                            label={t('manualProduct.quantityLabel')}
                            required
                            error={errors.quantity?.message}
                        >
                            {(fieldProps) => (
                                <Controller
                                    control={control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <QuantityStepper
                                            {...fieldProps}
                                            value={field.value || 1}
                                            onChange={field.onChange}
                                            size="sm"
                                            className="w-fit!"
                                            inputAriaLabel={t(
                                                'manualProduct.quantityLabel'
                                            )}
                                        />
                                    )}
                                />
                            )}
                        </FormField>
                        <FormField
                            label={t('manualProduct.categoryLabel')}
                            error={errors.category?.message}
                        >
                            {(fieldProps) => (
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <Select
                                            {...fieldProps}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            options={CATEGORIES}
                                            error={!!errors.category}
                                        />
                                    )}
                                />
                            )}
                        </FormField>
                    </div>

                    <FormField
                        label={t('manualProduct.expiryLabel')}
                        error={errors.expiryDate?.message}
                    >
                        {(fieldProps) => (
                            <Controller
                                control={control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <DatePicker
                                        {...fieldProps}
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        error={!!errors.expiryDate}
                                    />
                                )}
                            />
                        )}
                    </FormField>

                    <FormField
                        label={t('manualProduct.notesLabel')}
                        error={errors.notes?.message}
                    >
                        {(fieldProps) => (
                            <Textarea
                                {...fieldProps}
                                className={`w-full rounded-xl border-2 bg-white p-4 text-sm font-medium transition-all focus:outline-none focus:ring-0 dark:bg-slate-950 dark:text-slate-100 ${
                                    errors.notes
                                        ? 'border-destructive'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500'
                                }`}
                                rows={3}
                                placeholder={t(
                                    'manualProduct.notesPlaceholder'
                                )}
                                {...register('notes')}
                            />
                        )}
                    </FormField>

                    <NutrimentSection
                        register={register}
                        control={control}
                        errors={errors}
                        showAdvanced={showAdvanced}
                        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
                    />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="w-full h-12 rounded-2xl text-base"
                        >
                            {isSubmitting
                                ? t('manualProduct.submitting')
                                : t('manualProduct.submit')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
