'use client'

import Image from 'next/image'
import { CheckCircle2, Mail, ShieldCheck, User as UserIcon } from 'lucide-react'
import type { User as FirebaseUser } from 'firebase/auth'

interface ProfileSummaryCardProps {
    user: FirebaseUser
}

export const ProfileSummaryCard = ({ user }: ProfileSummaryCardProps) => {
    const providers = user.providerData.map((provider) => provider.providerId)
    const providerLabel = providers.includes('google.com')
        ? 'Google account'
        : providers.includes('password')
          ? 'Email and password'
          : 'Connected account'
    const joinedDate = user.metadata.creationTime
        ? new Intl.DateTimeFormat(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          }).format(new Date(user.metadata.creationTime))
        : null

    return (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    {user.photoURL ? (
                        <Image
                            src={user.photoURL}
                            alt={user.displayName || 'Profile'}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserIcon size={32} />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-xl font-bold text-slate-900 dark:text-slate-50">
                            {user.displayName || 'User'}
                        </h2>
                        {user.emailVerified && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <CheckCircle2 size={13} />
                                Verified
                            </span>
                        )}
                    </div>
                    <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm text-slate-500 dark:text-slate-400">
                        <Mail size={15} className="shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </p>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                        Sign-in method
                    </p>
                    <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <ShieldCheck size={17} className="text-emerald-500" />
                        {providerLabel}
                    </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                        Member since
                    </p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                        {joinedDate ?? 'Not available'}
                    </p>
                </div>
            </div>
        </div>
    )
}

ProfileSummaryCard.displayName = 'ProfileSummaryCard'
