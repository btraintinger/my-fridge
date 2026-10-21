'use client'

import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import React, { forwardRef } from 'react'
import {
    Controller,
    type Control,
    type FieldErrors,
    type UseFormRegister,
} from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/FormField'
import { Select } from '@/components/forms/SelectField'
import type { ManualProductFormData } from '@/lib/validations'

interface NutrimentInputProps extends Omit<
    React.ComponentProps<'input'>,
    'type'
> {
    unit: string
}

const NutrimentInput = forwardRef<HTMLInputElement, NutrimentInputProps>(
    ({ unit, className, ...props }, ref) => (
        <div className="relative">
            <Input
                ref={ref}
                type="number"
                inputMode="decimal"
                step="0.1"
                min={0}
                placeholder="0"
                className={`pr-12 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className ?? ''}`}
                {...props}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {unit}
            </span>
        </div>
    )
)
NutrimentInput.displayName = 'NutrimentInput'

export function NutrimentSection({
    register,
    control,
    errors,
    showAdvanced,
    onToggleAdvanced,
}: {
    register: UseFormRegister<ManualProductFormData>
    control: Control<ManualProductFormData>
    errors: FieldErrors<ManualProductFormData>
    showAdvanced: boolean
    onToggleAdvanced: () => void
}) {
    const t = useTranslations()
    return (
        <Collapsible
            open={showAdvanced}
            onOpenChange={onToggleAdvanced}
            className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
        >
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    type="button"
                    className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300"
                >
                    {t('manualProduct.advancedData')}
                    <ChevronDown
                        size={18}
                        className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    />
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <FormField
                    label={t('scanner.nutriScore')}
                    error={errors.nutriscore_grade?.message}
                >
                    {(fieldProps) => (
                        <Controller
                            control={control}
                            name="nutriscore_grade"
                            render={({ field }) => (
                                <Select
                                    {...fieldProps}
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
                    )}
                </FormField>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {t('scanner.nutritionTitle')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        label={t('scanner.energy')}
                        error={errors.energy_kcal?.message}
                    >
                        {(fieldProps) => (
                            <NutrimentInput
                                {...fieldProps}
                                unit="kcal"
                                {...register('energy_kcal', {
                                    valueAsNumber: true,
                                })}
                            />
                        )}
                    </FormField>
                    <FormField
                        label={t('scanner.fat')}
                        error={errors.fat?.message}
                    >
                        {(fieldProps) => (
                            <NutrimentInput
                                {...fieldProps}
                                unit="g"
                                {...register('fat', {
                                    valueAsNumber: true,
                                })}
                            />
                        )}
                    </FormField>
                    <FormField
                        label={t('scanner.saturatedFat')}
                        error={errors.saturated_fat?.message}
                    >
                        {(fieldProps) => (
                            <NutrimentInput
                                {...fieldProps}
                                unit="g"
                                {...register('saturated_fat', {
                                    valueAsNumber: true,
                                })}
                            />
                        )}
                    </FormField>
                    <FormField
                        label={t('scanner.carbohydrates')}
                        error={errors.carbohydrates?.message}
                    >
                        {(fieldProps) => (
                            <NutrimentInput
                                {...fieldProps}
                                unit="g"
                                {...register('carbohydrates', {
                                    valueAsNumber: true,
                                })}
                            />
                        )}
                    </FormField>
                    <FormField
                        label={t('scanner.sugars')}
                        error={errors.sugars?.message}
                    >
                        {(fieldProps) => (
                            <NutrimentInput
                                {...fieldProps}
                                unit="g"
                                {...register('sugars', {
                                    valueAsNumber: true,
                                })}
                            />
                        )}
                    </FormField>
                    <FormField
                        label={t('scanner.proteins')}
                        error={errors.proteins?.message}
                    >
                        {(fieldProps) => (
                            <NutrimentInput
                                {...fieldProps}
                                unit="g"
                                {...register('proteins', {
                                    valueAsNumber: true,
                                })}
                            />
                        )}
                    </FormField>
                    <FormField
                        label={t('scanner.salt')}
                        error={errors.salt?.message}
                    >
                        {(fieldProps) => (
                            <NutrimentInput
                                {...fieldProps}
                                unit="g"
                                {...register('salt', {
                                    valueAsNumber: true,
                                })}
                            />
                        )}
                    </FormField>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
