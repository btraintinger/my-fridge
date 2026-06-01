import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

function initAdminApp() {
    if (getApps().length) return getApps()[0]

    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    if (!privateKey) {
        console.warn(
            'FIREBASE_PRIVATE_KEY is missing. Firebase Admin SDK will not be initialized.'
        )
        return null
    }

    return initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey,
        }),
    })
}

const adminApp = initAdminApp()

// Fallback to dummy objects if admin SDK is not configured (e.g. local dev)
export const adminAuth = adminApp
    ? getAuth(adminApp)
    : ({} as ReturnType<typeof getAuth>)
export const adminDb = adminApp
    ? getFirestore(adminApp)
    : ({} as ReturnType<typeof getFirestore>)
export const adminMessaging = adminApp
    ? getMessaging(adminApp)
    : ({} as ReturnType<typeof getMessaging>)
