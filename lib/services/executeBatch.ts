import { writeBatch, type WriteBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Creates a Firestore write batch, passes it to `fn` for population,
 * then commits it. Handles the writeBatch(db) / batch.commit() boilerplate.
 */
export async function executeBatch(
    fn: (batch: WriteBatch) => void
): Promise<void> {
    const batch = writeBatch(db)
    fn(batch)
    await batch.commit()
}
