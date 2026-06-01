import { getTranslations } from 'next-intl/server'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import type { NotificationDoc, NotificationPreferences } from '../types'
import { routing } from '../../i18n/routing'
import { adminAuth, adminMessaging } from './firebaseAdmin'
import {
    userAdminDoc,
    userFcmTokenAdminRef,
    userFcmTokensAdminRef,
} from './refs'

type SupportedLocale = (typeof routing.locales)[number]

// Error codes from Firebase Admin SDK that mean the token is dead
const DEAD_TOKEN_CODES = new Set([
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
])

// Category key derived from notification type — used to check user preferences
function categoryEnabled(
    prefs: NotificationPreferences | undefined,
    type: NotificationDoc['type']
): boolean {
    if (!prefs) return true // default all-on when no prefs saved
    switch (type) {
        case 'fridge_invite':
            return prefs.invites
        case 'fridge_activity':
            return prefs.fridgeActivity
        case 'shopping_list_activity':
            return prefs.shoppingList
        case 'expiration_alert':
            return prefs.expirationAlerts
    }
}

function isSupportedLocale(value: unknown): value is SupportedLocale {
    return (
        typeof value === 'string' &&
        (routing.locales as readonly string[]).includes(value)
    )
}

export interface OutgoingNotification {
    type: NotificationDoc['type']
    titleKey: string
    bodyKey: string
    params?: Record<string, string | number>
    link?: string
    tag?: string
}

export async function sendToUser(
    uid: string,
    n: OutgoingNotification
): Promise<void> {
    // 1. Load user doc once (for preferences + locale)
    const userData = (await userAdminDoc(uid).get()).data()
    const prefs = userData?.notificationPreferences
    const locale: SupportedLocale = isSupportedLocale(userData?.locale)
        ? userData.locale
        : routing.defaultLocale

    if (!categoryEnabled(prefs, n.type)) return

    const t = await getTranslations({ locale, namespace: 'pushNotifications' })

    // Params with a "@@" prefix are looked up as translation keys (so defaults
    // like "Someone" / "a fridge" follow the recipient's locale).
    const params: Record<string, string | number> = {}
    if (n.params) {
        for (const [k, v] of Object.entries(n.params)) {
            params[k] =
                typeof v === 'string' && v.startsWith('@@')
                    ? t(v.slice(2) as Parameters<typeof t>[0])
                    : v
        }
    }

    // next-intl's key types are statically-checked; we accept runtime keys, so cast.
    const title = t(n.titleKey as Parameters<typeof t>[0], params)
    const body = t(n.bodyKey as Parameters<typeof t>[0], params)

    // Load FCM tokens
    const tokensSnap = await userFcmTokensAdminRef(uid).get()

    if (tokensSnap.empty) return

    const tokens = tokensSnap.docs.map((d: QueryDocumentSnapshot) => d.id)

    // Send in batches of 500 (Firebase hard limit)
    for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500)
        const response = await adminMessaging.sendEachForMulticast({
            tokens: batch,
            // data-only payload — SW handler controls the notification display
            data: {
                title,
                body,
                link: n.link ?? '/',
                tag: n.tag ?? '',
                type: n.type,
            },
            webpush: {
                fcmOptions: { link: n.link ?? '/' },
            },
        })

        // Clean up dead tokens
        const deletes: Promise<FirebaseFirestore.WriteResult>[] = []
        response.responses.forEach(
            (r: (typeof response.responses)[number], idx: number) => {
                if (
                    !r.success &&
                    r.error?.code &&
                    DEAD_TOKEN_CODES.has(r.error.code)
                ) {
                    deletes.push(userFcmTokenAdminRef(uid, batch[idx]).delete())
                }
            }
        )
        await Promise.all(deletes)
    }
}

export async function findUidByEmail(email: string): Promise<string | null> {
    try {
        const userRecord = await adminAuth.getUserByEmail(email)
        return userRecord.uid
    } catch {
        return null
    }
}

// Resolves a display value for the user who triggered a notification.
// `name` is the Firebase Auth displayName (carried in the ID token's `name`
// claim). Falls back to the email local-part, then a localized "Someone".
export function actorDisplayName(
    name: string | null,
    email: string | null
): string {
    if (name && name.trim()) return name.trim()
    if (email) {
        const localPart = email.split('@')[0]
        if (localPart) return localPart
    }
    return '@@someone'
}
