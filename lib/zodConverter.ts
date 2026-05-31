import type {
    DocumentData,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    WithFieldValue,
} from 'firebase/firestore';
import type { ZodSchema } from 'zod';

export function zodConverter<T extends DocumentData>(
    schema: ZodSchema<T>
): FirestoreDataConverter<T> {
    return {
        toFirestore(data: WithFieldValue<T>): DocumentData {
            const validated = schema.parse(data);
            return validated;
        },
        fromFirestore(
            snapshot: QueryDocumentSnapshot<DocumentData>,
            options?: SnapshotOptions
        ): T {
            const data = snapshot.data(options);

            const dataWithMeta = {
                ...data,
                id: snapshot.id,
                ref: snapshot.ref,
            };

            return schema.parse(dataWithMeta);
        },
    };
}