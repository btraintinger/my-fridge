'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { FormField } from './ui/FormField'
import { manualProductSchema, type ManualProductFormData } from '../lib/validations'
import type { Product } from '../lib/types'
import toast from 'react-hot-toast'

const CATEGORIES = [
    'Milchprodukte',
    'Fleisch & Fisch',
    'Gemüse & Obst',
    'Snacks & Süßes',
    'Getränke',
    'Tiefkühl',
    'Sonstiges',
]

interface ManualProductModalProps {
    onClose: () => void
    onSubmit: (
        product: Product,
        options: { quantity: number; expiryDate?: string; notes?: string }
    ) => Promise<void>
}

export function ManualProductModal({ onClose, onSubmit }: ManualProductModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<ManualProductFormData>({
        resolver: zodResolver(manualProductSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            quantity: 1,
            category: CATEGORIES[0],
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
            toast.success(`"${data.name}" hinzugefügt!`)
            onClose()
        } catch (error) {
            console.error('Failed to add manual product', error)
            toast.error('Produkt konnte nicht hinzugefügt werden.')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full duration-300 border-x border-t sm:border border-white/10">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Produkt manuell anlegen</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 overflow-y-auto space-y-5">
                    <FormField label="Produktname" required error={errors.name?.message}>
                        <Input
                            placeholder="z.B. Äpfel vom Markt"
                            error={!!errors.name}
                            className="h-12"
                            {...register('name')}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Menge" required error={errors.quantity?.message}>
                            <Input
                                type="number"
                                min="1"
                                error={!!errors.quantity}
                                className="h-12"
                                {...register('quantity', { valueAsNumber: true })}
                            />
                        </FormField>
                        <FormField label="Kategorie" error={errors.category?.message}>
                            <select
                                className={`w-full h-12 rounded-xl border-2 bg-white px-4 text-sm font-medium transition-all focus:outline-none focus:ring-0 dark:bg-slate-950 dark:text-slate-100 ${errors.category
                                        ? 'border-red-500'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500'
                                    }`}
                                {...register('category')}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>

                    <FormField label="Ablaufdatum" error={errors.expiryDate?.message}>
                        <Input
                            type="date"
                            className="h-12"
                            {...register('expiryDate')}
                        />
                    </FormField>

                    <FormField label="Notizen" error={errors.notes?.message}>
                        <textarea
                            className={`w-full rounded-xl border-2 bg-white p-4 text-sm font-medium transition-all focus:outline-none focus:ring-0 dark:bg-slate-950 dark:text-slate-100 ${errors.notes
                                    ? 'border-red-500'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500'
                                }`}
                            rows={3}
                            placeholder="Weitere Details zum Produkt..."
                            {...register('notes')}
                        />
                    </FormField>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="w-full h-12 rounded-2xl text-base"
                        >
                            {isSubmitting ? 'Wird hinzugefügt...' : 'In den Kühlschrank legen'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
