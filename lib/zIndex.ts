/**
 * Centralised z-index scale. Importing these constants instead of writing
 * arbitrary `z-*` classes keeps the layering hierarchy intact when
 * action bars, navigation, modals, and toasts overlap.
 */
export const zIndex = {
    nav: 40,
    actionBar: 30,
    modal: 50,
    toast: 60,
} as const

export type ZIndexLayer = keyof typeof zIndex
