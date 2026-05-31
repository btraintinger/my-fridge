'use client'

import { updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { getMessaging, getToken } from 'firebase/messaging'
import { useEffect, useState, useCallback, useRef } from 'react'
import { app } from '@/lib/firebase'
import {
    getCurrentPermission,
    isPushSupported,
    onForegroundMessage,
    requestPermissionAndRegister,
    unregister,
} from '@/lib/messaging'
import { notify } from '@/lib/notify'
import { userFcmTokenRef } from '@/lib/services/refs'

interface NotificationState {
    permission: NotificationPermission | 'unsupported' | 'loading'
    isRegistering: boolean
    isRegistered: boolean
    error: string | null
}

export function useNotifications(uid: string | null) {
    const [state, setState] = useState<NotificationState>({
        permission: 'loading',
        isRegistering: false,
        isRegistered: false,
        error: null,
    })
    const tokenRefreshedThisSession = useRef(false)

    // On mount: check current permission + token existence
    useEffect(() => {
        if (!uid) return

        let cancelled = false

        async function init() {
            const perm = await getCurrentPermission()
            if (cancelled) return

            if (perm !== 'granted') {
                setState((s) => ({ ...s, permission: perm, isRegistered: false }))
                return
            }

            // Resolve permission immediately so the UI renders while the
            // token/registration check runs in the background.
            setState((s) => ({ ...s, permission: 'granted' }))

            // Check if a token exists for this device
            try {
                const registration = await navigator.serviceWorker.ready
                const messaging = getMessaging(app)
                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
                    serviceWorkerRegistration: registration,
                }).catch(() => null)

                if (cancelled) return

                if (token) {
                    const ref = userFcmTokenRef(uid!, token)
                    const snap = await getDoc(ref)
                    if (cancelled) return

                    if (snap.exists()) {
                        // Touch lastSeenAt once per session
                        if (!tokenRefreshedThisSession.current) {
                            tokenRefreshedThisSession.current = true
                            await updateDoc(ref, { lastSeenAt: serverTimestamp() }).catch(() => {})
                        }
                        setState((s) => ({ ...s, permission: 'granted', isRegistered: true }))
                    } else {
                        setState((s) => ({ ...s, permission: 'granted', isRegistered: false }))
                    }
                } else {
                    setState((s) => ({ ...s, permission: 'granted', isRegistered: false }))
                }
            } catch {
                if (!cancelled) {
                    setState((s) => ({ ...s, permission: perm as NotificationPermission, isRegistered: false }))
                }
            }
        }

        init()
        return () => { cancelled = true }
    }, [uid])

    // Refresh token on tab focus (once per session)
    useEffect(() => {
        if (!uid) return

        async function handleVisibilityChange() {
            if (document.visibilityState !== 'visible') return
            if (tokenRefreshedThisSession.current) return
            if (Notification.permission !== 'granted') return

            try {
                const registration = await navigator.serviceWorker.ready
                const messaging = getMessaging(app)
                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
                    serviceWorkerRegistration: registration,
                }).catch(() => null)

                if (!token) return
                tokenRefreshedThisSession.current = true
                const ref = userFcmTokenRef(uid!, token)
                await updateDoc(ref, { lastSeenAt: serverTimestamp() }).catch(() => {})
            } catch {
                // non-fatal
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [uid])

    // Foreground message handler
    useEffect(() => {
        if (!uid || state.permission !== 'granted' || !state.isRegistered) return

        const supported = isPushSupported()
        let unsubscribe: (() => void) | null = null

        supported.then((ok) => {
            if (!ok) return
            unsubscribe = onForegroundMessage((payload) => {
                const title = payload.data?.title ?? 'MyFridge'
                const body = payload.data?.body ?? ''
                const link = payload.data?.link

                notify.info(body ? `${title} — ${body}` : title)

                if (link) {
                    // Navigation is handled by the user clicking the toast — no auto-nav
                }
            })
        })

        return () => { unsubscribe?.() }
    }, [uid, state.permission, state.isRegistered])

    const enable = useCallback(async () => {
        if (!uid) return
        setState((s) => ({ ...s, isRegistering: true, error: null }))
        try {
            const result = await requestPermissionAndRegister(uid)
            if (result.ok) {
                setState((s) => ({ ...s, isRegistering: false, isRegistered: true, permission: 'granted' }))
            } else {
                setState((s) => ({
                    ...s,
                    isRegistering: false,
                    permission: result.reason === 'denied' ? 'denied' : 'unsupported',
                    error: result.reason ?? null,
                }))
            }
        } catch (err) {
            console.error('[notifications] enable() failed:', err)
            const msg = err instanceof Error ? err.message : 'Failed to enable notifications'
            setState((s) => ({ ...s, isRegistering: false, error: msg }))
        }
    }, [uid])

    const disable = useCallback(async () => {
        if (!uid) return
        setState((s) => ({ ...s, isRegistering: true, error: null }))
        try {
            await unregister(uid)
            setState((s) => ({ ...s, isRegistering: false, isRegistered: false }))
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to disable notifications'
            setState((s) => ({ ...s, isRegistering: false, error: msg }))
        }
    }, [uid])

    return { ...state, enable, disable }
}