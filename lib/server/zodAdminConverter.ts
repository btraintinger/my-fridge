import type {
    DocumentData,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    WithFieldValue,
} from 'firebase-admin/firestore'
import type { ZodType } from 'zod'

export function zodAdminConverter<T extends DocumentData>(
    schema: ZodType<T>
): FirestoreDataConverter<T> {
    return {
        toFirestore(data: WithFieldValue<T>): DocumentData {
            return schema.parse(data) as DocumentData
        },
        fromFirestore(snapshot: QueryDocumentSnapshot): T {
            return schema.parse({
                ...snapshot.data(),
                id: snapshot.id,
                ref: snapshot.ref,
            })
        },
    }
}
