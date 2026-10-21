import { useEffect, useState } from 'react'
import type { FirestoreError } from 'firebase/firestore'

/**
 * Generic Firestore onSnapshot wrapper.
 *
 * Pass a `factory` that calls a subscribe function and returns its
 * unsubscribe callback, or `undefined` to skip the subscription.
 * Pass `deps` exactly like a useEffect dependency array — the effect
 * re-runs whenever a dep changes.
 */
export function useFirebaseSubscription<T>(
    factory: (
        onData: (data: T) => void,
        onError: (err: FirestoreError) => void
    ) => (() => void) | undefined,
    deps: readonly unknown[]
): { data: T | null; loading: boolean; error: FirestoreError | null } {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<FirestoreError | null>(null)

    useEffect(() => {
        const unsub = factory(
            (d) => {
                setData(d)
                setLoading(false)
                setError(null)
            },
            (e) => {
                setError(e)
                setLoading(false)
            }
        )
        if (!unsub) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setData(null)
            setLoading(false)
            return
        }
        return unsub
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return { data, loading, error }
}
