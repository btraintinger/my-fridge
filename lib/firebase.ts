import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// On HTTPS origins, route the OAuth handler through our own domain (proxied to
// firebaseapp.com by the next.config rewrite) so signInWithRedirect isn't broken
// by browsers blocking third-party storage. Dev (http://localhost) keeps the
// firebaseapp.com authDomain because localhost is exempt from cookie blocking
// and Firebase requires https for the handler URL.
if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    !window.location.host.endsWith('.firebaseapp.com')
) {
    firebaseConfig.authDomain = window.location.host
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)

// Use modern Firestore initialization with persistent cache
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
    }),
})

export { app, auth, db }
