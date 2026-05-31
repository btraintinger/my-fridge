import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Quantity-weighted modal Nutri-Score. Each entry contributes its quantity
 * (default 1) to its grade bucket, so 3 grade-A items outweigh 1 grade-D item.
 */
export function modalNutriScore(
    entries: { grade: string | null | undefined; quantity?: number }[]
): string | null {
    const counts: Record<string, number> = {}
    for (const { grade, quantity } of entries) {
        const key = normalizeGrade(grade)
        if (!key) continue
        counts[key] = (counts[key] ?? 0) + Math.max(1, quantity ?? 1)
    }
    return modalFromCounts(counts)
}

export function modalFromCounts(
    counts: Record<string, number> | undefined | null
): string | null {
    if (!counts) return '-'
    const top = Object.entries(counts)
        .filter(([, n]) => n > 0)
        .sort((a, b) => b[1] - a[1])[0]
    return top ? top[0] : '-'
}

/**
 * Lowercased grade or null for invalid/unknown values. Used to key into
 * gradeCounts so we never store "unknown" / "-" / null buckets.
 */
export function normalizeGrade(
    grade: string | null | undefined
): string | null {
    if (!grade) return null
    const key = grade.toLowerCase()
    if (key === 'unknown' || key === '-') return null
    return key
}
