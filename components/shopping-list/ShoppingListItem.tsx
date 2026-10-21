'use client'

import { TooltipButton } from '@/components/feedback/TooltipButton'

import { Check, ScanLine, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { ShoppingListItem as ShoppingListItemType } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { QuantityStepper } from '@/components/forms/QuantityStepper'
import { Select } from '@/components/forms/SelectField'

interface ShoppingListItemProps {
    item: ShoppingListItemType
    onToggle: (itemId: string, checked: boolean) => void
    onScan: (itemId: string) => void
    onDelete: (itemId: string) => void
    onRename: (itemId: string, name: string) => Promise<void>
    onUpdateDetails: (
        itemId: string,
        details: { quantity?: number; unit?: string }
    ) => Promise<void>
}

const UNIT_KEYS = [
    'none',
    'piece',
    'pack',
    'can',
    'bottle',
    'bunch',
    'g',
    'kg',
    'ml',
    'l',
] as const

export function ShoppingListItem({
    item,
    onToggle,
    onScan,
    onDelete,
    onRename,
    onUpdateDetails,
}: ShoppingListItemProps) {
    const t = useTranslations('shoppingList')
    const tCommon = useTranslations('common')
    const tUnits = useTranslations('shoppingList.units')
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(item.name)
    const [saving, setSaving] = useState(false)
    const [editingDetails, setEditingDetails] = useState(false)

    const unitOptions = UNIT_KEYS.map((key) => ({
        value: key === 'none' ? '' : tUnits(key),
        label: tUnits(key),
    }))

    const saveEdit = async () => {
        const trimmed = draft.trim()
        if (!trimmed || trimmed === item.name) {
            setEditing(false)
            setDraft(item.name)
            return
        }
        setSaving(true)
        try {
            await onRename(item.id!, trimmed)
            setEditing(false)
        } finally {
            setSaving(false)
        }
    }

    const updateQuantity = async (next: number) => {
        await onUpdateDetails(item.id!, { quantity: next })
    }

    const updateUnit = async (next: string) => {
        await onUpdateDetails(item.id!, { unit: next })
    }

    const hasDetails = item.quantity != null || Boolean(item.unit)

    if (item.checked) {
        return (
            <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
                <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => onToggle(item.id!, item.checked)}
                    aria-label={item.name}
                    className="size-6 min-h-0 min-w-0 rounded-full"
                />
                <span className="flex-1 text-slate-400 dark:text-slate-500 font-medium line-through decoration-slate-300 dark:decoration-slate-700">
                    {item.name}
                </span>
                {hasDetails && (
                    <span className="h-9 px-3 inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 whitespace-nowrap line-through">
                        {item.quantity != null && (
                            <span className="text-sm font-bold tabular-nums">
                                {item.quantity}
                            </span>
                        )}
                        {item.unit && (
                            <span className="text-xs font-medium">
                                {item.unit}
                            </span>
                        )}
                    </span>
                )}
                <TooltipButton
                    tooltip={tCommon('delete')}
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => onDelete(item.id!)}
                    aria-label={tCommon('delete')}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                >
                    <Trash2 size={18} />
                </TooltipButton>
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
            {/* Main row */}
            <div className="flex items-center gap-2 p-4">
                <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => onToggle(item.id!, item.checked)}
                    aria-label={item.name}
                    className="size-6 min-h-0 min-w-0 rounded-full border-2"
                />
                {editing ? (
                    <form
                        className="flex-1 flex items-center gap-2"
                        onSubmit={(e) => {
                            e.preventDefault()
                            saveEdit()
                        }}
                    >
                        <Input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    e.preventDefault()
                                    setEditing(false)
                                    setDraft(item.name)
                                }
                            }}
                            className="flex-1 h-11 py-0"
                        />
                        <TooltipButton
                            tooltip={t('saveItemName')}
                            type="submit"
                            size="sm"
                            disabled={saving}
                            className="px-3 min-h-[44px]"
                            aria-label={t('saveItemName')}
                        >
                            <Check size={18} />
                        </TooltipButton>
                    </form>
                ) : (
                    <TooltipButton
                        variant="ghost"
                        type="button"
                        onClick={() => {
                            setDraft(item.name)
                            setEditing(true)
                        }}
                        className="flex-1 justify-start text-left text-slate-900 dark:text-slate-100 font-medium truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        tooltip={t('editItemName')}
                    >
                        {item.name}
                    </TooltipButton>
                )}
                {!editing && (
                    <>
                        <TooltipButton
                            variant="ghost"
                            type="button"
                            onClick={() => setEditingDetails((v) => !v)}
                            className={`h-9 px-3 inline-flex items-center gap-1 rounded-xl transition-colors whitespace-nowrap active:scale-95 ${
                                hasDetails
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                            tooltip={
                                hasDetails ? t('editDetails') : t('addDetails')
                            }
                        >
                            {hasDetails ? (
                                <>
                                    {item.quantity != null && (
                                        <span className="text-sm font-bold tabular-nums">
                                            {item.quantity}
                                        </span>
                                    )}
                                    {item.unit && (
                                        <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">
                                            {item.unit}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-xs font-semibold">
                                    {t('addDetailsShort')}
                                </span>
                            )}
                        </TooltipButton>
                        <TooltipButton
                            aria-label={t('itemScanTooltip')}
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => onScan(item.id!)}
                            className="text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 p-2 rounded-xl transition-all active:scale-95"
                            tooltip={t('itemScanTooltip')}
                        >
                            <ScanLine size={18} />
                        </TooltipButton>
                        <TooltipButton
                            tooltip={tCommon('delete')}
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => onDelete(item.id!)}
                            aria-label={tCommon('delete')}
                            className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl transition-all active:scale-95"
                        >
                            <Trash2 size={18} />
                        </TooltipButton>
                    </>
                )}
            </div>

            {/* Inline edit panel — only when actively editing details */}
            {!editing && editingDetails && (
                <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-2xl">
                    <QuantityStepper
                        value={item.quantity ?? 1}
                        onChange={updateQuantity}
                        size="sm"
                        tone="emerald"
                        inputAriaLabel={t('quantityPlaceholder')}
                    />
                    <Select
                        value={item.unit ?? ''}
                        onChange={updateUnit}
                        options={unitOptions}
                        size="sm"
                        placeholder={t('unitPlaceholder')}
                        className="flex-1 max-w-[140px]"
                    />
                    <TooltipButton
                        aria-label={t('cancelEdit')}
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setEditingDetails(false)}
                        className="ml-auto text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl transition-colors active:scale-95"
                        tooltip={t('cancelEdit')}
                    >
                        <X size={16} />
                    </TooltipButton>
                </div>
            )}
        </div>
    )
}
