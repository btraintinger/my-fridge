'use client'

import {
    SettingsCollapsibleCard,
    SettingsSwitchRow,
} from '@/components/settings/SettingsCard'

import { Bell, BellOff, BellRing } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/forms/SelectField'
import { useNotifications } from '@/components/settings/useNotifications'
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
        <SettingsCollapsibleCard
            open={isOpen}
            onOpenChange={setIsOpen}
            icon={isRegistered ? BellRing : Bell}
            title={t('title')}
            summary={summary}
        >
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
            {permission !== 'unsupported' && permission !== 'denied' && (
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
                    <Switch
                        checked={isRegistered}
                        disabled={isRegistering}
                        onCheckedChange={(checked) =>
                            void (checked ? enable() : disable())
                        }
                        aria-label={isRegistered ? t('disable') : t('enable')}
                    />
                </div>
            )}

            {/* Category switches — only when registered */}
            {isRegistered && (
                <div className="border-t border-slate-100 dark:border-slate-800">
                    {CATEGORY_KEYS.map((key) => (
                        <SettingsSwitchRow
                            key={key}
                            label={t(`categories.${key}`)}
                            checked={prefs[key]}
                            onCheckedChange={() =>
                                void handleCategoryToggle(key)
                            }
                        />
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
        </SettingsCollapsibleCard>
    )
}

NotificationsCard.displayName = 'NotificationsCard'
