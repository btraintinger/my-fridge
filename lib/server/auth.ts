import { timingSafeEqual } from 'node:crypto'
import { adminAuth } from './firebaseAdmin'

type AuthenticatedUser = {
    uid: string
    email: string | null
    name: string | null
}

function getBearerToken(request: Request): string | null {
    const authorization = request.headers.get('Authorization')
    return authorization?.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : null
}

function unauthorizedResponse(): Response {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    })
}

export async function requireAuth(
    request: Request
): Promise<AuthenticatedUser> {
    const token = getBearerToken(request)

    if (!token) {
        throw unauthorizedResponse()
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
        throw unauthorizedResponse()
    }
}

export function requireCronSecret(request: Request): void {
    const secret = getBearerToken(request)
    const expectedSecret = process.env.CRON_SECRET

    if (!secret || !expectedSecret) {
        throw unauthorizedResponse()
    }

    const supplied = Buffer.from(secret)
    const expected = Buffer.from(expectedSecret)
    if (
        supplied.length !== expected.length ||
        !timingSafeEqual(supplied, expected)
    ) {
        throw unauthorizedResponse()
    }
}
