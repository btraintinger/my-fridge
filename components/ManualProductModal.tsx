'use client'

import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { FormField } from './ui/FormField'
import { Select } from './ui/Select'
import { DatePicker } from './ui/DatePicker'
import { createManualProductSchema, type ManualProductFormData } from '@/lib/validations'
import type { Product } from '@/lib/types'

interface ManualProductModalProps {
    onClose: () => void
    onSubmit: (
        product: Product,
        options: { quantity: number; expiryDate?: string; notes?: string }
    ) => Promise<void>
}

export function ManualProductModal({ onClose, onSubmit }: ManualProductModalProps) {
    const t = useTranslations()
    const schema = useMemo(() => createManualProductSchema(t), [t])

    const CATEGORIES = useMemo(() => [
        { value: t('manualProduct.categories.dairy'), label: t('manualProduct.categories.dairy') },
        { value: t('manualProduct.categories.meatFish'), label: t('manualProduct.categories.meatFish') },
        { value: t('manualProduct.categories.vegFruit'), label: t('manualProduct.categories.vegFruit') },
        { value: t('manualProduct.categories.snacks'), label: t('manualProduct.categories.snacks') },
        { value: t('manualProduct.categories.drinks'), label: t('manualProduct.categories.drinks') },
        { value: t('manualProduct.categories.frozen'), label: t('manualProduct.categories.frozen') },
        { value: t('manualProduct.categories.other'), label: t('manualProduct.categories.other') },
    ], [t])

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting, isValid },
    } = useForm<ManualProductFormData>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            quantity: 1,
            category: CATEGORIES[0].value,
            expiryDate: '',
            notes: '',
        },
    })

    const onFormSubmit = async (data: ManualProductFormData) => {
        try {
            const dummyProduct: Product = {
                barcode: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                product_name: data.name.trim(),
                brands: '-',
                labels: ['Manuell'],
                image_url: '',
                nutriscore_grade: null,
                allergens: '',
                ingredients: '',
                origin_country: '',
                sold_in_countries: '',
                dietary_flags: { vegan: null, vegetarian: null, palm_oil_free: null },
                nutriments: {
                    energy_kcal: 0,
                    fat: 0,
                    saturated_fat: 0,
                    carbohydrates: 0,
                    sugars: 0,
                    proteins: 0,
                    salt: 0,
                    fiber: 0,
                },
                ecoscore_grade: null,
                category: data.category,
            }

            await onSubmit(dummyProduct, {
                quantity: data.quantity,
                expiryDate: data.expiryDate || undefined,
                notes: data.notes?.trim() || undefined,
            })
            onClose()
        } catch (error) {
            console.error('Failed to add manual product', error)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full duration-300 border-x border-t sm:border border-white/10">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t('manualProduct.title')}</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 overflow-y-auto space-y-5">
                    <FormField label={t('manualProduct.nameLabel')} required error={errors.name?.message}>
                        <Input
                            placeholder={t('manualProduct.namePlaceholder')}
                            error={!!errors.name}
                            className="h-12"
                            {...register('name')}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('manualProduct.quantityLabel')} required error={errors.quantity?.message}>
                            <Input
                                type="number"
                                min="1"
                                error={!!errors.quantity}
                                className="h-12"
                                {...register('quantity', { valueAsNumber: true })}
                            />
                        </FormField>
                        <FormField label={t('manualProduct.categoryLabel')} error={errors.category?.message}>
                            <Controller
                                control={control}
                                name="category"
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        options={CATEGORIES}
                                        error={!!errors.category}
                                    />
                                )}
                            />
                        </FormField>
                    </div>

                    <FormField label={t('manualProduct.expiryLabel')} error={errors.expiryDate?.message}>
                        <Controller
                            control={control}
                            name="expiryDate"
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    error={!!errors.expiryDate}
                                />
                            )}
                        />
                    </FormField>

                    <FormField label={t('manualProduct.notesLabel')} error={errors.notes?.message}>
                        <textarea
                            className={`w-full rounded-xl border-2 bg-white p-4 text-sm font-medium transition-all focus:outline-none focus:ring-0 dark:bg-slate-950 dark:text-slate-100 ${errors.notes
                                    ? 'border-red-500'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500'
                                }`}
                            rows={3}
                            placeholder={t('manualProduct.notesPlaceholder')}
                            {...register('notes')}
                        />
                    </FormField>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="w-full h-12 rounded-2xl text-base"
                        >
                            {isSubmitting ? t('manualProduct.submitting') : t('manualProduct.submit')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
