'use client'

import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { Button } from './Button'
import { auth } from '@/lib/firebase'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'
import { FcGoogle } from 'react-icons/fc'

export function GoogleSignInButton({
    text = 'Sign in with Google',
    className = '',
}: {
    text?: string
    className?: string
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError('')

        const provider = new GoogleAuthProvider()
        try {
            await signInWithPopup(auth, provider)
            router.push('/fridges')
        } catch (err: unknown) {
            console.error('Google sign in error:', err)
            setError(
                getFirebaseAuthErrorMessage(
                    err,
                    'Failed to sign in with Google.'
                )
            )
        } finally {
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
                {loading ? 'Connecting...' : text}
            </Button>
        </div>
    )
}
