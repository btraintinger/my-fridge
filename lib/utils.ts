import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Calculates the modal (most frequent) Nutri-Score from an array of grades.
 */
export function modalNutriScore(grades: (string | null)[]): string | null {
    const counts: Record<string, number> = {}
    for (const g of grades) {
        if (!g) continue
        const key = g.toLowerCase()
        if (key === 'unknown' || key === '-') continue
        counts[key] = (counts[key] ?? 0) + 1
    }
    const entries = Object.entries(counts)
    if (entries.length === 0) return '-'
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
}
