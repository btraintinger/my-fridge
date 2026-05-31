import { auth } from './firebase'

export async function postNotify(path: string, body: unknown): Promise<void> {
    const token = await auth.currentUser?.getIdToken().catch(() => null)
    if (!token) return

    fetch(`/api/notifications/${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    }).catch((err) => console.error('notify failed', err))
    // fire-and-forget: do NOT await
}
