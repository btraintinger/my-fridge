import { adminAuth } from './firebaseAdmin'

export async function requireAuth(
    request: Request
): Promise<{ uid: string; email: string | null; name: string | null }> {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
        throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const decoded = await adminAuth.verifyIdToken(token)
        const userRecord = await adminAuth.getUser(decoded.uid)
        return {
            uid: decoded.uid,
            email: userRecord.email ?? decoded.email ?? null,
            name: userRecord.displayName ?? null,
        }
    } catch {
        throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}

export function requireCronSecret(request: Request): void {
    const authHeader = request.headers.get('Authorization')
    const secret = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null

    if (!secret || secret !== process.env.CRON_SECRET) {
        throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
