import { deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
    deleteToken,
    getMessaging,
    getToken,
    isSupported,
    onMessage,
    type MessagePayload,
    type Unsubscribe,
} from 'firebase/messaging'
import { app } from './firebase'
import { userFcmTokenRef } from './services/refs'

export async function isPushSupported(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    if (!('serviceWorker' in navigator)) return false
    if (!('PushManager' in window)) return false
    return isSupported()
}

export async function getCurrentPermission(): Promise<
    NotificationPermission | 'unsupported'
> {
    if (typeof window === 'undefined' || !('Notification' in window))
        return 'unsupported'
    return Notification.permission
}

export async function requestPermissionAndRegister(
    uid: string
): Promise<{ ok: boolean; reason?: string; token?: string }> {
    if (!(await isPushSupported())) return { ok: false, reason: 'unsupported' }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { ok: false, reason: 'denied' }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
        throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY is not configured')
    }

    const registration = await navigator.serviceWorker.ready

    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
    })

    await setDoc(
        userFcmTokenRef(uid, token),
        {
            userAgent: navigator.userAgent,
            createdAt: serverTimestamp(),
            lastSeenAt: serverTimestamp(),
        },
        { merge: true }
    )

    return { ok: true, token }
}

export async function unregister(uid: string): Promise<void> {
    const registration = await navigator.serviceWorker.ready
    const messaging = getMessaging(app)

    const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        serviceWorkerRegistration: registration,
    }).catch(() => null)

    await deleteToken(messaging)

    if (token) {
        await deleteDoc(userFcmTokenRef(uid, token))
    }
}

export function onForegroundMessage(
    cb: (payload: MessagePayload) => void
): Unsubscribe {
    const messaging = getMessaging(app)
    return onMessage(messaging, cb)
}
