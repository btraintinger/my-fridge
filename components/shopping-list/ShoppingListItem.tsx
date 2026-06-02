'use client'

import { Check, ScanLine, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { ShoppingListItem as ShoppingListItemType } from '@/lib/types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { QuantityStepper } from '../ui/QuantityStepper'
import { Select } from '../ui/Select'

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
                <button
                    onClick={() => onToggle(item.id!, item.checked)}
                    className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </button>
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
                <button
                    onClick={() => onDelete(item.id!)}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
            {/* Main row */}
            <div className="flex items-center gap-2 p-4">
                <button
                    onClick={() => onToggle(item.id!, item.checked)}
                    className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 flex-shrink-0 transition-all active:scale-90"
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
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={saving}
                            className="px-3 min-h-[44px]"
                            aria-label={t('saveItemName')}
                        >
                            <Check size={18} />
                        </Button>
                    </form>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            setDraft(item.name)
                            setEditing(true)
                        }}
                        className="flex-1 text-left text-slate-900 dark:text-slate-100 font-medium truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        title={t('editItemName')}
                    >
                        {item.name}
                    </button>
                )}
                {!editing && (
                    <>
                        <button
                            onClick={() => setEditingDetails((v) => !v)}
                            className={`h-9 px-3 inline-flex items-center gap-1 rounded-xl transition-colors whitespace-nowrap active:scale-95 ${
                                hasDetails
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                            title={
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
                        </button>
                        <button
                            onClick={() => onScan(item.id!)}
                            className="text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 p-2 rounded-xl transition-all active:scale-95"
                            title={t('itemScanTooltip')}
                        >
                            <ScanLine size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(item.id!)}
                            className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl transition-all active:scale-95"
                        >
                            <Trash2 size={18} />
                        </button>
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
                    <button
                        type="button"
                        onClick={() => setEditingDetails(false)}
                        className="ml-auto text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl transition-colors active:scale-95"
                        title={t('cancelEdit')}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}
