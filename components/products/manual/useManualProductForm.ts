import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
    createManualProductSchema,
    type ManualProductFormData,
} from '@/lib/validations'
import type { Product } from '@/lib/types'
import { PRODUCT_CATEGORIES } from '@/lib/products/productCategories'

function generateManualBarcode(): string {
    return `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

export function useManualProductForm({
    onSubmit,
    onClose,
}: {
    onSubmit: (
        product: Product,
        options: { quantity: number; expiryDate?: string; notes?: string }
    ) => Promise<void>
    onClose: () => void
}) {
    const t = useTranslations()
    const schema = useMemo(() => createManualProductSchema(t), [t])

    const CATEGORIES = useMemo(
        () =>
            PRODUCT_CATEGORIES.map((key) => ({
                value: key,
                label: t(`manualProduct.categories.${key}`),
            })),
        [t]
    )

    const form = useForm<ManualProductFormData>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            quantity: 1,
            category: 'other',
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
            const product: Product = {
                barcode: generateManualBarcode(),
                product_name: data.name.trim(),
                brands: '-',
                labels: ['manual'],
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

            await onSubmit(product, {
                quantity: data.quantity,
                expiryDate: data.expiryDate || undefined,
                notes: data.notes?.trim() || undefined,
            })
            onClose()
        } catch (error) {
            console.error('Failed to add manual product', error)
        }
    }

    return { ...form, onFormSubmit, CATEGORIES }
}
