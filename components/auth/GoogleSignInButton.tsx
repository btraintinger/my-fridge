'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
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
                <Alert
                    variant="destructive"
                    className="p-3 bg-error/10 text-error rounded-xl text-xs font-medium border border-error/20 mb-3"
                >
                    <AlertDescription className="text-inherit">
                        {error}
                    </AlertDescription>
                </Alert>
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
