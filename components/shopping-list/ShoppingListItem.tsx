'use client'

import { Pencil, ScanLine, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { ShoppingListItem as ShoppingListItemType } from '@/lib/types'

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

export function ShoppingListItem({
    item,
    onToggle,
    onScan,
    onDelete,
    onRename,
    onUpdateDetails,
}: ShoppingListItemProps) {
    const t = useTranslations('shoppingList')
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(item.name)
    const [saving, setSaving] = useState(false)
    const [editingDetails, setEditingDetails] = useState(false)
    const [qtyDraft, setQtyDraft] = useState(
        item.quantity != null ? String(item.quantity) : ''
    )
    const [unitDraft, setUnitDraft] = useState(item.unit ?? '')
    const [savingDetails, setSavingDetails] = useState(false)

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

    const openDetails = () => {
        setQtyDraft(item.quantity != null ? String(item.quantity) : '')
        setUnitDraft(item.unit ?? '')
        setEditingDetails(true)
    }

    const saveDetails = async () => {
        setSavingDetails(true)
        try {
            const qty = qtyDraft.trim() ? parseFloat(qtyDraft) : undefined
            const unit = unitDraft.trim() || undefined
            await onUpdateDetails(item.id!, {
                ...(qty != null && !isNaN(qty)
                    ? { quantity: qty }
                    : { quantity: undefined }),
                unit,
            })
            setEditingDetails(false)
        } finally {
            setSavingDetails(false)
        }
    }

    const detailLabel = (() => {
        const parts: string[] = []
        if (item.quantity != null) parts.push(String(item.quantity))
        if (item.unit) parts.push(item.unit)
        return parts.join(' ') || null
    })()

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
                {detailLabel && (
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/50 px-2 py-0.5 rounded-md whitespace-nowrap line-through">
                        {detailLabel}
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
            <div className="flex items-center gap-3 p-4 pb-3">
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
                        <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setEditing(false)
                                    setDraft(item.name)
                                }
                            }}
                            className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-400/50"
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                            {t('saveItemName')}
                        </button>
                    </form>
                ) : (
                    <span className="flex-1 text-slate-900 dark:text-slate-100 font-medium">
                        {item.name}
                    </span>
                )}
                {!editing && (
                    <>
                        {detailLabel && (
                            <button
                                onClick={openDetails}
                                className="text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border border-violet-200/70 dark:border-violet-900/50 px-2 py-0.5 rounded-md hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors whitespace-nowrap"
                                title={t('editDetails')}
                            >
                                {detailLabel}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setDraft(item.name)
                                setEditing(true)
                            }}
                            className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 rounded-xl transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                            title={t('editItemName')}
                        >
                            <Pencil size={16} />
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

            {/* Detail row — quantity+unit, shown when editing or as add-prompt */}
            {!editing && (
                <div className="px-4 pb-3">
                    {editingDetails ? (
                        <form
                            className="flex items-center gap-2"
                            onSubmit={(e) => {
                                e.preventDefault()
                                saveDetails()
                            }}
                        >
                            <input
                                autoFocus
                                type="number"
                                min="0"
                                step="any"
                                value={qtyDraft}
                                onChange={(e) => setQtyDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape')
                                        setEditingDetails(false)
                                }}
                                placeholder={t('quantityPlaceholder')}
                                className="w-20 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-violet-300 dark:border-violet-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-violet-400/50"
                            />
                            <input
                                type="text"
                                value={unitDraft}
                                onChange={(e) => setUnitDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape')
                                        setEditingDetails(false)
                                }}
                                placeholder={t('unitPlaceholder')}
                                className="w-20 text-xs font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-violet-300 dark:border-violet-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-violet-400/50"
                            />
                            <button
                                type="submit"
                                disabled={savingDetails}
                                className="text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-2 py-1 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50"
                            >
                                {t('saveItemName')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingDetails(false)}
                                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 px-1 py-1 transition-colors"
                            >
                                {t('cancelEdit')}
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={openDetails}
                            className="text-xs text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        >
                            + {t('addDetails')}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
