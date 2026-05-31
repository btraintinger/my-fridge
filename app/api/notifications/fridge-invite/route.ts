export const dynamic = 'force-dynamic'

import { COLLECTIONS } from '@/lib/constants'
import { requireAuth } from '@/lib/server/auth'
import { adminDb } from '@/lib/server/firebaseAdmin'
import { actorDisplayName, findUidByEmail, sendToUser } from '@/lib/server/sendNotification'

export async function POST(request: Request) {
    try {
        const { uid, email: callerEmail, name: callerName } = await requireAuth(request)
        const body = await request.json() as { fridgeId?: string; inviteeEmail?: string }

        if (!body.fridgeId || !body.inviteeEmail) {
            return Response.json({ error: 'Missing fridgeId or inviteeEmail' }, { status: 400 })
        }

        // Verify caller owns the fridge
        const fridgeSnap = await adminDb.collection(COLLECTIONS.FRIDGES).doc(body.fridgeId).get()
        if (!fridgeSnap.exists || fridgeSnap.data()?.userId !== uid) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const inviteeUid = await findUidByEmail(body.inviteeEmail)
        if (!inviteeUid) {
            return Response.json({ ok: true }) // user not registered — silent no-op
        }

        const fridgeName = fridgeSnap.data()?.name as string | undefined
        await sendToUser(inviteeUid, {
            type: 'fridge_invite',
            titleKey: 'fridgeInvite.title',
            bodyKey: 'fridgeInvite.body',
            params: {
                who: actorDisplayName(callerName, callerEmail),
                fridgeName: fridgeName ?? '@@unnamedFridge',
            },
            link: `/fridges/${body.fridgeId}`,
            tag: `fridge-invite-${body.fridgeId}`,
        })

        return Response.json({ ok: true })
    } catch (e) {
        if (e instanceof Response) return e
        console.error('fridge-invite route error', e)
        return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
