export type OfflineMutationType =
    | 'createFridge'
    | 'shareFridge'
    | 'unshareFridge'
    | 'deleteItem'
    | 'addItemToFridge'
    | 'addShoppingItem'
    | 'toggleShoppingItem'
    | 'deleteShoppingItem'
    | 'moveShoppingItemToFridge'
    | 'updateItemQuantity'

export interface OfflineMutation {
    id: string
    type: OfflineMutationType
    dedupeKey?: string
    createdAt: number
    payload: Record<string, unknown>
}

const STORAGE_KEY = 'myfridge-offline-mutations-v1'

function isBrowserEnvironment() {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function readQueue(): OfflineMutation[] {
    if (!isBrowserEnvironment()) return []

    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []

        const parsed = JSON.parse(raw) as OfflineMutation[]
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function writeQueue(queue: OfflineMutation[]) {
    if (!isBrowserEnvironment()) return

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
    window.dispatchEvent(new Event('myfridge-offline-mutations-updated'))
}

function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getOfflineMutationCount() {
    return readQueue().length
}

export function getOfflineMutations() {
    return readQueue().sort((left, right) => left.createdAt - right.createdAt)
}

export function enqueueOfflineMutation(
    mutation: Omit<OfflineMutation, 'id' | 'createdAt'>
) {
    if (!isBrowserEnvironment()) return

    const queue = readQueue()
    const nextMutation: OfflineMutation = {
        ...mutation,
        id: createId(),
        createdAt: Date.now(),
    }

    if (nextMutation.dedupeKey) {
        const deduped = queue.filter(
            (item) => item.dedupeKey !== nextMutation.dedupeKey
        )
        deduped.push(nextMutation)
        writeQueue(deduped)
        return
    }

    queue.push(nextMutation)
    writeQueue(queue)
}

export function removeOfflineMutation(id: string) {
    if (!isBrowserEnvironment()) return

    writeQueue(readQueue().filter((mutation) => mutation.id !== id))
}

export function clearOfflineMutations() {
    if (!isBrowserEnvironment()) return

    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('myfridge-offline-mutations-updated'))
}

export async function flushOfflineMutations() {
    if (!isBrowserEnvironment()) return 0

    const queue = readQueue()
    if (queue.length === 0) return 0

    clearOfflineMutations()
    return queue.length
}
