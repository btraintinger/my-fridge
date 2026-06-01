'use client'

import { Bell, BellOff, BellRing, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { cn } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/constants'
import type { NotificationPreferences } from '@/lib/types'

const DEFAULT_PREFS: NotificationPreferences = {
    invites: true,
    fridgeActivity: true,
    shoppingList: true,
    expirationAlerts: true,
    expirationLeadDays: 3,
}

const CATEGORY_KEYS = [
    'invites',
    'fridgeActivity',
    'shoppingList',
    'expirationAlerts',
] as const

type CategoryKey = (typeof CATEGORY_KEYS)[number]

export const NotificationsCard = () => {
    const t = useTranslations('settings.notifications')
    const { user } = useAuth()
    const uid = user?.uid ?? null

    const { permission, isRegistering, isRegistered, enable, disable } =
        useNotifications(uid)

    const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS)
    const [isOpen, setIsOpen] = useState(false)

    const writePrefs = useCallback(
        async (next: NotificationPreferences) => {
            if (!uid) return
            await setDoc(
                doc(db, COLLECTIONS.USERS, uid),
                { notificationPreferences: next },
                { merge: true }
            )
        },
        [uid]
    )

    const handleCategoryToggle = useCallback(
        async (key: CategoryKey) => {
            const next = { ...prefs, [key]: !prefs[key] }
            setPrefs(next)
            await writePrefs(next)
        },
        [prefs, writePrefs]
    )

    const handleLeadDaysChange = useCallback(
        async (days: number) => {
            const next = { ...prefs, expirationLeadDays: days }
            setPrefs(next)
            await writePrefs(next)
        },
        [prefs, writePrefs]
    )

    if (permission === 'loading') return null

    const activeCount = isRegistered
        ? CATEGORY_KEYS.filter((k) => prefs[k]).length
        : 0

    const summary = isRegistered
        ? t('activeCount', { count: activeCount })
        : t('description')

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Collapsible header */}
            <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((v) => !v)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 dark:hover:bg-slate-800/40 sm:p-5"
            >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {isRegistered ? <BellRing size={20} /> : <Bell size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">
                        {t('title')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {summary}
                    </p>
                </div>
                <ChevronDown
                    size={20}
                    className={cn(
                        'shrink-0 text-slate-400 transition-transform dark:text-slate-500',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <>
                    {/* Unsupported (iOS Safari without home-screen install) */}
                    {permission === 'unsupported' && (
                        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800 sm:px-5 sm:pb-5">
                            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <BellOff size={15} className="shrink-0" />
                                {t('unsupportedIosHelp')}
                            </p>
                        </div>
                    )}

                    {/* Denied — browser blocked notifications */}
                    {permission === 'denied' && (
                        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800 sm:px-5 sm:pb-5">
                            <p className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                <BellOff size={15} className="shrink-0" />
                                {t('permissionDeniedHelp')}
                            </p>
                        </div>
                    )}

                    {/* Master toggle — shown when push is not denied/unsupported */}
                    {permission !== 'unsupported' &&
                        permission !== 'denied' && (
                            <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {isRegistering
                                        ? isRegistered
                                            ? t('disabling')
                                            : t('enabling')
                                        : isRegistered
                                          ? t('disable')
                                          : t('enable')}
                                </span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isRegistered}
                                    disabled={isRegistering}
                                    onClick={() =>
                                        void (isRegistered
                                            ? disable()
                                            : enable())
                                    }
                                    className={cn(
                                        'relative h-8 w-14 flex-none overflow-hidden rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-0 disabled:opacity-50',
                                        isRegistered
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-200 dark:bg-slate-800'
                                    )}
                                    aria-label={
                                        isRegistered
                                            ? t('disable')
                                            : t('enable')
                                    }
                                >
                                    <span
                                        className={cn(
                                            'absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform',
                                            isRegistered
                                                ? 'translate-x-6'
                                                : 'translate-x-0'
                                        )}
                                    />
                                </button>
                            </div>
                        )}

                    {/* Category switches — only when registered */}
                    {isRegistered && (
                        <div className="border-t border-slate-100 dark:border-slate-800">
                            {CATEGORY_KEYS.map((key) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-800 sm:px-5"
                                >
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {t(`categories.${key}`)}
                                    </span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={prefs[key]}
                                        aria-label={t(`categories.${key}`)}
                                        onClick={() =>
                                            void handleCategoryToggle(key)
                                        }
                                        className={cn(
                                            'relative h-6 w-11 flex-none overflow-hidden rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-0',
                                            prefs[key]
                                                ? 'bg-emerald-500'
                                                : 'bg-slate-200 dark:bg-slate-700'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                                                prefs[key]
                                                    ? 'translate-x-5'
                                                    : 'translate-x-0'
                                            )}
                                        />
                                    </button>
                                </div>
                            ))}

                            {/* Expiration lead-days picker */}
                            {prefs.expirationAlerts && (
                                <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {t('expirationLeadDays.label')}
                                    </span>
                                    <Select
                                        size="sm"
                                        className="w-44"
                                        value={String(prefs.expirationLeadDays)}
                                        onChange={(v) =>
                                            void handleLeadDaysChange(Number(v))
                                        }
                                        options={[
                                            {
                                                value: '1',
                                                label: t(
                                                    'expirationLeadDays.options.1d'
                                                ),
                                            },
                                            {
                                                value: '3',
                                                label: t(
                                                    'expirationLeadDays.options.3d'
                                                ),
                                            },
                                            {
                                                value: '7',
                                                label: t(
                                                    'expirationLeadDays.options.7d'
                                                ),
                                            },
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

NotificationsCard.displayName = 'NotificationsCard'
