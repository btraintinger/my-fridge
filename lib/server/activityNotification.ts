import { requireAuth } from '@/lib/server/auth'
import { fridgeAdminDoc } from '@/lib/services/refs.server'
import {
    actorDisplayName,
    findUidByEmail,
    sendToUser,
} from './sendNotification'

const ACTION_SUFFIXES = {
    item_added: 'itemAdded',
    item_removed: 'itemRemoved',
    item_checked: 'itemChecked',
} as const

interface ActivityNotificationOptions {
    type: 'fridge_activity' | 'shopping_list_activity'
    messagePrefix: 'fridgeActivity' | 'shoppingListActivity'
    tagPrefix: string
    logLabel: string
}

function isAction(value: unknown): value is keyof typeof ACTION_SUFFIXES {
    return typeof value === 'string' && Object.hasOwn(ACTION_SUFFIXES, value)
}

export function createActivityNotificationHandler(
    options: ActivityNotificationOptions
) {
    return async function POST(request: Request) {
        try {
            const { uid, email, name } = await requireAuth(request)
            const body: unknown = await request.json()
            if (!body || typeof body !== 'object') {
                return Response.json(
                    { error: 'Missing fields' },
                    { status: 400 }
                )
            }
            const { fridgeId, action, itemName } = body as Record<
                string,
                unknown
            >
            if (
                typeof fridgeId !== 'string' ||
                !fridgeId ||
                typeof itemName !== 'string' ||
                !itemName ||
                !isAction(action)
            ) {
                return Response.json(
                    { error: 'Missing fields' },
                    { status: 400 }
                )
            }

            const fridge = (await fridgeAdminDoc(fridgeId).get()).data()
            const callerEmail = email?.toLowerCase()
            const isOwner = fridge?.userId === uid
            const isShared = Boolean(
                callerEmail && fridge?.sharedWithEmails.includes(callerEmail)
            )
            // Do not distinguish a missing fridge from a fridge the caller cannot access.
            if (!fridge || (!isOwner && !isShared)) {
                return Response.json({ error: 'Forbidden' }, { status: 403 })
            }

            const recipients = new Set<string>()
            if (fridge.userId !== uid) recipients.add(fridge.userId)
            const sharedUids = await Promise.all(
                fridge.sharedWithEmails
                    .filter((memberEmail) => memberEmail !== callerEmail)
                    .map(findUidByEmail)
            )
            for (const recipient of sharedUids) {
                if (recipient && recipient !== uid) recipients.add(recipient)
            }

            const baseKey = `${options.messagePrefix}.${ACTION_SUFFIXES[action]}`
            const who = actorDisplayName(name, email)
            await Promise.all(
                [...recipients].map((recipient) =>
                    sendToUser(recipient, {
                        type: options.type,
                        titleKey: `${baseKey}.title`,
                        bodyKey: `${baseKey}.body`,
                        params: { who, itemName },
                        link: `/fridges/${fridgeId}`,
                        tag: `${options.tagPrefix}-${fridgeId}`,
                    })
                )
            )
            return Response.json({ ok: true })
        } catch (error) {
            if (error instanceof Response) return error
            console.error(`${options.logLabel} route error`, error)
            return Response.json(
                { error: 'Internal Server Error' },
                { status: 500 }
            )
        }
    }
}
