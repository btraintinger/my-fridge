export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { requireCronSecret } from '@/lib/server/auth'
import { adminDb } from '@/lib/server/firebaseAdmin'
import { fridgesAdminCollection, userAdminDoc } from '@/lib/server/refs'
import { findUidByEmail, sendToUser } from '@/lib/server/sendNotification'
import { COLLECTIONS } from '@/lib/constants'

const DEFAULT_LEAD_DAYS = 3
const MAX_LEAD_DAYS = 7

export async function GET(request: Request) {
    try {
        requireCronSecret(request)

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const cutoff = new Date(today)
        cutoff.setDate(cutoff.getDate() + MAX_LEAD_DAYS)

        // Format as YYYY-MM-DD for string comparison
        const todayStr = today.toISOString().slice(0, 10)
        const cutoffStr = cutoff.toISOString().slice(0, 10)

        // today's tag to collapse duplicate cron runs
        const digestTag = `expiration-digest-${todayStr}`

        const fridgesSnap = await fridgesAdminCollection().get()
        if (fridgesSnap.empty) return Response.json({ ok: true, processed: 0 })

        interface ExpiringItem { name: string; expiryDate: string; fridgeId: string }
        interface RecipientData { items: ExpiringItem[]; uid: string | null }

        const recipientMap = new Map<string, RecipientData>() // keyed by email or uid

        const BATCH_SIZE = 10
        const fridgeDocs = fridgesSnap.docs

        for (let i = 0; i < fridgeDocs.length; i += BATCH_SIZE) {
            const batch = fridgeDocs.slice(i, i + BATCH_SIZE)

            await Promise.all(batch.map(async (fridgeDoc) => {
                const fridgeData = fridgeDoc.data()
                const fridgeId = fridgeDoc.id
                const ownerUid = fridgeData.userId
                const sharedEmails = fridgeData.sharedWithEmails

                // Query items expiring within the max window (string comparison works for ISO dates)
                const itemsSnap = await adminDb
                    .collection(COLLECTIONS.FRIDGES)
                    .doc(fridgeId)
                    .collection(COLLECTIONS.ITEMS)
                    .where('expiryDate', '>=', todayStr)
                    .where('expiryDate', '<=', cutoffStr)
                    .get()

                if (itemsSnap.empty) return

                const expiringItems: ExpiringItem[] = itemsSnap.docs.map((d) => ({
                    name: d.data().product?.product_name ?? d.data().product?.id ?? 'Unknown item',
                    expiryDate: d.data().expiryDate as string,
                    fridgeId,
                }))

                const addItems = (key: string, uid: string | null) => {
                    const existing = recipientMap.get(key)
                    if (existing) {
                        existing.items.push(...expiringItems)
                    } else {
                        recipientMap.set(key, { items: [...expiringItems], uid })
                    }
                }

                addItems(ownerUid, ownerUid)
                for (const email of sharedEmails) {
                    addItems(email, null) // shared members keyed by email, uid resolved later
                }
            }))
        }

        if (recipientMap.size === 0) return Response.json({ ok: true, processed: 0 })

        const resolvePromises: Promise<void>[] = []
        for (const [key, data] of recipientMap.entries()) {
            if (data.uid === null) {
                resolvePromises.push(
                    findUidByEmail(key).then((uid) => { data.uid = uid })
                )
            }
        }
        await Promise.all(resolvePromises)

        let processed = 0
        const sendPromises: Promise<void>[] = []

        for (const [, data] of recipientMap.entries()) {
            if (!data.uid) continue

            const uid = data.uid
            sendPromises.push((async () => {
                const userSnap = await userAdminDoc(uid).get()
                const prefs = userSnap.data()?.notificationPreferences

                if (prefs?.expirationAlerts === false) return

                const leadDays = prefs?.expirationLeadDays ?? DEFAULT_LEAD_DAYS
                const userCutoff = new Date(today)
                userCutoff.setDate(userCutoff.getDate() + leadDays)
                const userCutoffStr = userCutoff.toISOString().slice(0, 10)

                const userItems = data.items.filter(
                    (item) => item.expiryDate >= todayStr && item.expiryDate <= userCutoffStr
                )
                if (userItems.length === 0) return

                const top3 = userItems.slice(0, 3).map((i) => i.name)
                const extra = userItems.length - top3.length
                const items = top3.join(', ')

                await sendToUser(uid, {
                    type: 'expiration_alert',
                    titleKey: 'expirationAlert.title',
                    bodyKey: extra > 0 ? 'expirationAlert.bodyWithMore' : 'expirationAlert.body',
                    params: extra > 0
                        ? { count: userItems.length, items, extra }
                        : { count: userItems.length, items },
                    link: '/fridges',
                    tag: digestTag,
                })
                processed++
            })())
        }

        await Promise.all(sendPromises)

        return Response.json({ ok: true, processed })
    } catch (e) {
        if (e instanceof Response) return e
        console.error('expiration-alerts cron error', e)
        return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
