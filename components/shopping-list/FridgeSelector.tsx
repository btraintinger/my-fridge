import type { Fridge } from '@/lib/types'

interface FridgeSelectorProps {
    fridges: Fridge[]
    selectedFridge: string
    onSelect: (fridgeId: string) => void
}

export function FridgeSelector({
    fridges,
    selectedFridge,
    onSelect,
}: FridgeSelectorProps) {
    if (fridges.length === 0) return null

    return (
        <select
            value={selectedFridge}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-base font-medium text-slate-900 dark:text-slate-50 focus:border-emerald-500 focus:outline-none"
        >
            {fridges.map((f) => (
                <option key={f.id} value={f.id}>
                    {f.name}
                </option>
            ))}
        </select>
    )
}
