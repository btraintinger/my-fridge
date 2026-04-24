import { ScanLine, Trash2 } from 'lucide-react'
import type { ShoppingListItem as ShoppingListItemType } from '../../lib/types'

interface ShoppingListItemProps {
    item: ShoppingListItemType
    onToggle: (itemId: string, checked: boolean) => void
    onScan: (itemId: string) => void
    onDelete: (itemId: string) => void
}

export function ShoppingListItem({
    item,
    onToggle,
    onScan,
    onDelete,
}: ShoppingListItemProps) {
    if (item.checked) {
        return (
            <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
                <button
                    onClick={() => onToggle(item.id, item.checked)}
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
                <span className="flex-1 text-slate-400 dark:text-slate-500 font-medium line-through decoration-slate-300 dark:decoration-slate-700 transition-all">
                    {item.name}
                </span>
                <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
            <button
                onClick={() => onToggle(item.id, item.checked)}
                className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 flex-shrink-0 transition-all active:scale-90"
            />
            <span className="flex-1 text-slate-900 dark:text-slate-100 font-medium">
                {item.name}
            </span>
            <button
                onClick={() => onScan(item.id)}
                className="text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 p-2 rounded-xl transition-all active:scale-95"
                title="Scan to move to fridge"
            >
                <ScanLine size={18} />
            </button>
            <button
                onClick={() => onDelete(item.id)}
                className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl transition-all active:scale-95"
            >
                <Trash2 size={18} />
            </button>
        </div>
    )
}
