'use client'

import { useState } from 'react'
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { Button } from './Button'
import { auth } from '@/lib/firebase'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'
import { FcGoogle } from 'react-icons/fc'

export function GoogleSignInButton({
    text,
    className = '',
}: {
    text?: string
    className?: string
}) {
    const t = useTranslations()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const label = text ?? t('auth.google.default')

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError('')
        try {
            await signInWithRedirect(auth, new GoogleAuthProvider())
        } catch (err: unknown) {
            setError(
                getFirebaseAuthErrorMessage(err, t('auth.google.failed'), t)
            )
            setLoading(false)
        }
    }

    return (
        <div className={`w-full ${className}`}>
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100 mb-3">
                    {error}
                </div>
            )}
            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-slate-200"
                onClick={handleGoogleSignIn}
                disabled={loading}
            >
                <FcGoogle aria-hidden="true" className="h-4.5 w-4.5" />
                {loading ? t('auth.google.connecting') : label}
            </Button>
        </div>
    )
}
