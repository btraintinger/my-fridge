'use client'

import { useId, useState } from 'react'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import {
    PRODUCT_CATEGORIES,
    type ProductCategory,
} from '@/lib/products/productCategories'

export function CategoryEditor({
    category,
    onChange,
}: {
    category: ProductCategory
    onChange: (category: ProductCategory) => Promise<void>
}) {
    const id = useId()
    const t = useTranslations()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(false)

    const saveCategory = async (value: string) => {
        const next = PRODUCT_CATEGORIES.find((key) => key === value)
        if (!next || next === category || saving) return
        setSaving(true)
        setError(false)
        try {
            await onChange(next)
        } catch {
            setError(true)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-2">
            <Label
                htmlFor={id}
                className="text-sm font-bold text-slate-900 dark:text-slate-50"
            >
                {t('common.category')}
            </Label>
            <Select
                value={category}
                onValueChange={(value) => void saveCategory(value)}
                disabled={saving}
            >
                <SelectTrigger
                    id={id}
                    aria-busy={saving}
                    aria-invalid={error || undefined}
                    className="w-full min-h-11 rounded-xl border-2 text-base"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                    {PRODUCT_CATEGORIES.map((key) => (
                        <SelectItem key={key} value={key}>
                            {t(`fridges.detail.categories.${key}`)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p
                    role="alert"
                    className="text-sm text-rose-600 dark:text-rose-400"
                >
                    {t('productModal.categoryUpdateError')}
                </p>
            )}
        </div>
    )
}
