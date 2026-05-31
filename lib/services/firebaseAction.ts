import type {
    DocumentSnapshot,
    FirestoreError,
    QuerySnapshot,
} from 'firebase/firestore'
import { notify } from '../notify'

export async function runFirebaseAction<T>(
    action: () => Promise<T>,
    successMessage?: string
): Promise<T> {
    try {
        const result = await action()
        if (successMessage) notify.success(successMessage)
        return result
    } catch (error) {
        notify.error(error as Error)
        throw error
    }
}

export function subscriptionErrorHandler(
    onError?: (error: FirestoreError) => void
) {
    return (error: FirestoreError) => {
        if (error.code !== 'permission-denied') {
            notify.error(error)
        }
        onError?.(error)
    }
}

export function mapSnapshot<T>(snap: QuerySnapshot): T[] {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[]
}

export function docWithId<T>(snap: DocumentSnapshot): T | null {
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
}
