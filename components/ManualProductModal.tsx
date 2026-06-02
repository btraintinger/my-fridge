'use client'

import { forwardRef, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { X, ChevronDown } from 'lucide-react'
import { Button } from './ui/Button'
import { Input, type InputProps } from './ui/Input'
import { FormField } from './ui/FormField'
import { Select } from './ui/Select'
import { DatePicker } from './ui/DatePicker'
import { QuantityStepper } from './ui/QuantityStepper'
import {
    createManualProductSchema,
    type ManualProductFormData,
} from '@/lib/validations'
import type { Product } from '@/lib/types'

interface ManualProductModalProps {
    onClose: () => void
    onSubmit: (
        product: Product,
        options: { quantity: number; expiryDate?: string; notes?: string }
    ) => Promise<void>
}

function generateManualBarcode(): string {
    return `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

interface NutrimentInputProps extends Omit<InputProps, 'type'> {
    unit: string
}

const NutrimentInput = forwardRef<HTMLInputElement, NutrimentInputProps>(
    ({ unit, className, ...props }, ref) => {
        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min={0}
                    placeholder="0"
                    className={`pr-12 ${className ?? ''}`}
                    {...props}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {unit}
                </span>
            </div>
        )
    }
)
NutrimentInput.displayName = 'NutrimentInput'

export function ManualProductModal({
    onClose,
    onSubmit,
}: ManualProductModalProps) {
    const t = useTranslations()
    const [showAdvanced, setShowAdvanced] = useState(false)
    const schema = useMemo(() => createManualProductSchema(t), [t])

    const CATEGORIES = useMemo(
        () => [
            {
                value: t('manualProduct.categories.dairy'),
                label: t('manualProduct.categories.dairy'),
            },
            {
                value: t('manualProduct.categories.meatFish'),
                label: t('manualProduct.categories.meatFish'),
            },
            {
                value: t('manualProduct.categories.vegFruit'),
                label: t('manualProduct.categories.vegFruit'),
            },
            {
                value: t('manualProduct.categories.snacks'),
                label: t('manualProduct.categories.snacks'),
            },
            {
                value: t('manualProduct.categories.drinks'),
                label: t('manualProduct.categories.drinks'),
            },
            {
                value: t('manualProduct.categories.frozen'),
                label: t('manualProduct.categories.frozen'),
            },
            {
                value: t('manualProduct.categories.other'),
                label: t('manualProduct.categories.other'),
            },
        ],
        [t]
    )

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
            energy_kcal: 0,
            fat: 0,
            saturated_fat: 0,
            carbohydrates: 0,
            sugars: 0,
            proteins: 0,
            salt: 0,
        },
    })

    const onFormSubmit = async (data: ManualProductFormData) => {
        try {
            const dummyProduct: Product = {
                barcode: generateManualBarcode(),
                product_name: data.name.trim(),
                brands: '-',
                labels: ['Manuell'],
                image_url: '',
                nutriscore_grade: data.nutriscore_grade?.toLowerCase() || null,
                allergens: '',
                ingredients: '',
                origin_country: '',
                sold_in_countries: '',
                dietary_flags: {
                    vegan: null,
                    vegetarian: null,
                    palm_oil_free: null,
                },
                nutriments: {
                    energy_kcal: data.energy_kcal || 0,
                    fat: data.fat || 0,
                    saturated_fat: data.saturated_fat || 0,
                    carbohydrates: data.carbohydrates || 0,
                    sugars: data.sugars || 0,
                    proteins: data.proteins || 0,
                    salt: data.salt || 0,
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
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden animate-in slide-in-from-bottom-full duration-300 border-x border-t sm:border border-white/10">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        {t('manualProduct.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center h-9 w-9 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-5"
                >
                    <FormField
                        label={t('manualProduct.nameLabel')}
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            placeholder={t('manualProduct.namePlaceholder')}
                            error={!!errors.name}
                            className="h-12"
                            {...register('name')}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label={t('manualProduct.quantityLabel')}
                            required
                            error={errors.quantity?.message}
                        >
                            <Controller
                                control={control}
                                name="quantity"
                                render={({ field }) => (
                                    <QuantityStepper
                                        value={field.value || 1}
                                        onChange={field.onChange}
                                        size="lg"
                                        inputAriaLabel={t(
                                            'manualProduct.quantityLabel'
                                        )}
                                    />
                                )}
                            />
                        </FormField>
                        <FormField
                            label={t('manualProduct.categoryLabel')}
                            error={errors.category?.message}
                        >
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

                    <FormField
                        label={t('manualProduct.expiryLabel')}
                        error={errors.expiryDate?.message}
                    >
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

                    <FormField
                        label={t('manualProduct.notesLabel')}
                        error={errors.notes?.message}
                    >
                        <textarea
                            className={`w-full rounded-xl border-2 bg-white p-4 text-sm font-medium transition-all focus:outline-none focus:ring-0 dark:bg-slate-950 dark:text-slate-100 ${
                                errors.notes
                                    ? 'border-red-500'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500'
                            }`}
                            rows={3}
                            placeholder={t('manualProduct.notesPlaceholder')}
                            {...register('notes')}
                        />
                    </FormField>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300"
                        >
                            {t('manualProduct.advancedData')}
                            <ChevronDown
                                size={18}
                                className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {showAdvanced && (
                            <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <FormField
                                    label={t('scanner.nutriScore')}
                                    error={errors.nutriscore_grade?.message}
                                >
                                    <Controller
                                        control={control}
                                        name="nutriscore_grade"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                options={[
                                                    { value: '', label: '-' },
                                                    { value: 'A', label: 'A' },
                                                    { value: 'B', label: 'B' },
                                                    { value: 'C', label: 'C' },
                                                    { value: 'D', label: 'D' },
                                                    { value: 'E', label: 'E' },
                                                ]}
                                            />
                                        )}
                                    />
                                </FormField>

                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                                    {t('scanner.nutritionTitle')}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        label={t('scanner.energy')}
                                        error={errors.energy_kcal?.message}
                                    >
                                        <NutrimentInput
                                            unit="kcal"
                                            {...register('energy_kcal', {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t('scanner.fat')}
                                        error={errors.fat?.message}
                                    >
                                        <NutrimentInput
                                            unit="g"
                                            {...register('fat', {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t('scanner.saturatedFat')}
                                        error={errors.saturated_fat?.message}
                                    >
                                        <NutrimentInput
                                            unit="g"
                                            {...register('saturated_fat', {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t('scanner.carbohydrates')}
                                        error={errors.carbohydrates?.message}
                                    >
                                        <NutrimentInput
                                            unit="g"
                                            {...register('carbohydrates', {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t('scanner.sugars')}
                                        error={errors.sugars?.message}
                                    >
                                        <NutrimentInput
                                            unit="g"
                                            {...register('sugars', {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t('scanner.proteins')}
                                        error={errors.proteins?.message}
                                    >
                                        <NutrimentInput
                                            unit="g"
                                            {...register('proteins', {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </FormField>
                                    <FormField
                                        label={t('scanner.salt')}
                                        error={errors.salt?.message}
                                    >
                                        <NutrimentInput
                                            unit="g"
                                            {...register('salt', {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </FormField>
                                </div>
                            </div>
                        )}
                    </div>
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
            </div>
        </div>
    )
}
