export const dynamic = 'force-dynamic'

import { requireAuth } from '@/lib/server/auth'
import { fridgeAdminDoc } from '@/lib/server/refs'
import {
    actorDisplayName,
    findUidByEmail,
    sendToUser,
} from '@/lib/server/sendNotification'

type Action = 'item_added' | 'item_removed' | 'item_checked'

const ACTION_KEYS: Record<Action, string> = {
    item_added: 'shoppingListActivity.itemAdded',
    item_removed: 'shoppingListActivity.itemRemoved',
    item_checked: 'shoppingListActivity.itemChecked',
}

export async function POST(request: Request) {
    try {
        const {
            uid,
            email: callerEmail,
            name: callerName,
        } = await requireAuth(request)
        const body = (await request.json()) as {
            fridgeId?: string
            action?: Action
            itemName?: string
        }

        if (!body.fridgeId || !body.action || !body.itemName) {
            return Response.json({ error: 'Missing fields' }, { status: 400 })
        }

        const fridgeData = (await fridgeAdminDoc(body.fridgeId).get()).data()
        const callerEmail_lower = callerEmail?.toLowerCase()
        const isOwner = fridgeData?.userId === uid
        const isShared = !!(
            callerEmail_lower &&
            fridgeData?.sharedWithEmails.includes(callerEmail_lower)
        )

        // Single 403 for "missing" or "not a member" — don't reveal which.
        if (!fridgeData || (!isOwner && !isShared)) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const ownerUid = fridgeData.userId
        const sharedEmails = fridgeData.sharedWithEmails

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
        return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
