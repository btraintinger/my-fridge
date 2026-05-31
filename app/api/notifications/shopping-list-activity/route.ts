export const dynamic = 'force-dynamic'

import { COLLECTIONS } from '@/lib/constants'
import { requireAuth } from '@/lib/server/auth'
import { adminDb } from '@/lib/server/firebaseAdmin'
import { actorDisplayName, findUidByEmail, sendToUser } from '@/lib/server/sendNotification'

type Action = 'item_added' | 'item_removed' | 'item_checked'

const ACTION_KEYS: Record<Action, string> = {
    item_added: 'shoppingListActivity.itemAdded',
    item_removed: 'shoppingListActivity.itemRemoved',
    item_checked: 'shoppingListActivity.itemChecked',
}

export async function POST(request: Request) {
    try {
        const { uid, email: callerEmail, name: callerName } = await requireAuth(request)
        const body = await request.json() as { fridgeId?: string; action?: Action; itemName?: string }

        if (!body.fridgeId || !body.action || !body.itemName) {
            return Response.json({ error: 'Missing fields' }, { status: 400 })
        }

        const fridgeSnap = await adminDb.collection(COLLECTIONS.FRIDGES).doc(body.fridgeId).get()
        if (!fridgeSnap.exists) return Response.json({ error: 'Not found' }, { status: 404 })

        const fridgeData = fridgeSnap.data()!
        const ownerUid = fridgeData.userId as string
        const sharedEmails: string[] = fridgeData.sharedWithEmails ?? []

        // Caller must be owner or a shared member
        const callerEmail_lower = callerEmail?.toLowerCase()
        const isOwner = ownerUid === uid
        const isShared = callerEmail_lower ? sharedEmails.includes(callerEmail_lower) : false
        if (!isOwner && !isShared) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const baseKey = ACTION_KEYS[body.action]
        const who = actorDisplayName(callerName, callerEmail)

        // Notify all members except the caller
        const recipients: string[] = []
        if (ownerUid !== uid) recipients.push(ownerUid)

        // Resolve shared member emails to uids (skip caller's own email)
        const otherEmails = sharedEmails.filter((e) => e !== callerEmail_lower)
        const uidResults = await Promise.all(otherEmails.map(findUidByEmail))
        for (const u of uidResults) {
            if (u && u !== uid) recipients.push(u)
        }

        await Promise.all(
            recipients.map((recipientUid) =>
                sendToUser(recipientUid, {
                    type: 'shopping_list_activity',
                    titleKey: `${baseKey}.title`,
                    bodyKey: `${baseKey}.body`,
                    params: { who, itemName: body.itemName! },
                    link: `/fridges/${body.fridgeId}`,
                    tag: `shopping-list-${body.fridgeId}`,
                })
            )
        )

        return Response.json({ ok: true })
    } catch (e) {
        if (e instanceof Response) return e
        console.error('shopping-list-activity route error', e)
        return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
