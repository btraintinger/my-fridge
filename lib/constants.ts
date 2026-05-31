export const COLLECTIONS = {
    FRIDGES: 'fridges',
    PRODUCTS: 'products',
    ITEMS: 'items',
    SHOPPING_LIST: 'shopping_list',
    USERS: 'users',
    FCM_TOKENS: 'fcm_tokens',
} as const

export const NUTRI_GRADES = [
    { grade: 'a', bg: 'bg-green-500', label: 'A' },
    { grade: 'b', bg: 'bg-lime-500', label: 'B' },
    { grade: 'c', bg: 'bg-yellow-400', label: 'C' },
    { grade: 'd', bg: 'bg-orange-500', label: 'D' },
    { grade: 'e', bg: 'bg-red-500', label: 'E' },
] as const

export const GRADE_COLORS: Record<string, string> = {
    a: 'bg-green-500',
    b: 'bg-lime-500',
    c: 'bg-yellow-400',
    d: 'bg-orange-500',
    e: 'bg-red-500',
}
