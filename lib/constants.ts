export const COLLECTIONS = {
    FRIDGES: 'fridges',
    PRODUCTS: 'products',
    ITEMS: 'items',
    SHOPPING_LIST: 'shopping_list',
    USERS: 'users',
    FCM_TOKENS: 'fcm_tokens',
} as const

export const NUTRI_GRADES = [
    { grade: 'a', bg: 'bg-[#108c47]', label: 'A' },
    { grade: 'b', bg: 'bg-[#9ace21]', label: 'B' },
    { grade: 'c', bg: 'bg-[#fcb514]', label: 'C' },
    { grade: 'd', bg: 'bg-[#ee8100]', label: 'D' },
    { grade: 'e', bg: 'bg-[#e63e1b]', label: 'E' },
] as const

export const GRADE_COLORS: Record<string, string> = {
    a: 'bg-[#108c47]',
    b: 'bg-[#9ace21]',
    c: 'bg-[#fcb514]',
    d: 'bg-[#ee8100]',
    e: 'bg-[#e63e1b]',
}
