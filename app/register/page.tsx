'use client'

import { useState } from 'react'
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    updateProfile,
} from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseAuthErrors'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { GoogleSignInButton } from '../../components/ui/GoogleSignInButton'
import { AuthLayout } from '../../components/auth/AuthLayout'
import Link from 'next/link'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            await updateProfile(userCredential.user, { displayName: name })
            await sendEmailVerification(userCredential.user)
            await signOut(auth)
            router.push('/login?verification=sent')
        } catch (err: unknown) {
            setError(getFirebaseAuthErrorMessage(err, 'Failed to create an account.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Start managing your fridge waste-free."
        >
            <form onSubmit={handleRegister} className="w-full space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-100 dark:border-red-900/50 animate-in shake-in duration-300">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                        Name
                    </label>
                    <Input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                        Email
                    </label>
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                        Password
                    </label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4 h-14 rounded-2xl text-lg shadow-lg"
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
            </form>

            <div className="w-full flex items-center gap-4 my-8">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    Social login
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            <div className="w-full">
                <GoogleSignInButton text="Sign up with Google" />
            </div>

            <p className="mt-10 text-base text-slate-500 dark:text-slate-400 font-medium text-center">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-all"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    )
}
