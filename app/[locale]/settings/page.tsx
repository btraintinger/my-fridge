'use client'

import { useRouter } from '@/i18n/navigation'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { signOut } from 'firebase/auth'
import {
    ChevronRight,
    KeyRound,
    type LucideIcon,
    LogOut,
    Settings as SettingsIcon,
    ShieldAlert,
    Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DeleteAccountModal } from '@/components/settings/DeleteAccountModal'
import { NotificationsCard } from '@/components/settings/NotificationsCard'
import { PasswordChangeModal } from '@/components/settings/PasswordChangeModal'
import { ProfileSummaryCard } from '@/components/settings/ProfileSummaryCard'
import { ThemePreferenceCard } from '@/components/settings/ThemePreferenceCard'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { auth } from '@/lib/firebase'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/components/ui/Button'

const PASSWORD_PROVIDER_ID = 'password'

export default function Settings() {
    const { user, loading } = useAuth()
    const { darkMode, toggleDarkMode } = useTheme()
    const router = useRouter()
    const t = useTranslations('settings')

    const openDialog = useSettingsStore((state) => state.openDialog)

    const usesPasswordProvider = useMemo(
        () =>
            user?.providerData.some(
                (provider) => provider.providerId === PASSWORD_PROVIDER_ID
            ) ?? false,
        [user]
    )

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login')
        }
    }, [user, loading, router])

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            router.replace('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    if (loading || !user) return null

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 lg:pl-20 xl:pl-56">
            <div className="pt-safe">
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 pb-5 pt-12 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
                    <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <SettingsIcon size={22} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                                {t('title')}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-3xl space-y-8 p-6">
                <section className="space-y-3">
                    <SectionHeading
                        title={t('sections.account.title')}
                        description={t('sections.account.description')}
                    />
                    <ProfileSummaryCard user={user} />
                </section>

                <section className="space-y-3">
                    <SectionHeading
                        title={t('sections.preferences.title')}
                        description={t('sections.preferences.description')}
                    />
                    <ThemePreferenceCard
                        darkMode={darkMode}
                        onToggle={() => void toggleDarkMode()}
                    />
                </section>

                <section className="space-y-3">
                    <SectionHeading
                        title={t('sections.notifications.title')}
                        description={t('sections.notifications.description')}
                    />
                    <NotificationsCard />
                </section>

                <section className="space-y-3">
                    <SectionHeading
                        title={t('sections.language.title')}
                        description={t('sections.language.description')}
                    />
                    <LanguageSwitcher />
                </section>

                <section className="space-y-3">
                    <SectionHeading
                        title={t('sections.security.title')}
                        description={t('sections.security.description')}
                    />

                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        {usesPasswordProvider && (
                            <SettingsActionRow
                                icon={KeyRound}
                                title={t('actions.changePassword.title')}
                                description={t(
                                    'actions.changePassword.description'
                                )}
                                onClick={() => openDialog('password')}
                            />
                        )}
                        <SettingsActionRow
                            icon={LogOut}
                            title={t('actions.signOut.title')}
                            description={t('actions.signOut.description')}
                            onClick={handleSignOut}
                        />
                        <SettingsActionRow
                            icon={Trash2}
                            title={t('actions.deleteAccount.title')}
                            description={t('actions.deleteAccount.description')}
                            danger
                            onClick={() => openDialog('delete')}
                        />
                    </div>

                    <SettingsStatusMessages />
                </section>
            </div>

            {usesPasswordProvider && <PasswordChangeModal />}

            <DeleteAccountModal usesPasswordProvider={usesPasswordProvider} />
        </div>
    )
}

function SectionHeading({
    title,
    description,
}: {
    title: string
    description: string
}) {
    return (
        <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                {title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </div>
    )
}

function SettingsActionRow({
    icon: Icon,
    title,
    description,
    danger = false,
    onClick,
}: {
    icon: LucideIcon
    title: string
    description: string
    danger?: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group flex w-full items-center gap-4 border-b border-slate-100 p-4 text-left transition-colors last:border-b-0 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 dark:border-slate-800 dark:hover:bg-slate-800/60 sm:p-5',
                danger && 'hover:bg-red-50 dark:hover:bg-red-950/20'
            )}
        >
            <span
                className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                    danger &&
                        'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                )}
            >
                <Icon size={20} />
            </span>
            <span className="min-w-0 flex-1">
                <span
                    className={cn(
                        'block font-semibold text-slate-900 dark:text-slate-50',
                        danger && 'text-red-600 dark:text-red-400'
                    )}
                >
                    {title}
                </span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </span>
            </span>
            <ChevronRight
                size={19}
                className={cn(
                    'shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600',
                    danger && 'text-red-300 dark:text-red-800'
                )}
            />
        </button>
    )
}

function SettingsStatusMessages() {
    const activeDialog = useSettingsStore((state) => state.activeDialog)
    const passwordStatus = useSettingsStore((state) => state.password.status)
    const deleteStatus = useSettingsStore((state) => state.deleteAccount.status)

    return (
        <>
            {passwordStatus && activeDialog !== 'password' && (
                <StatusMessage>{passwordStatus}</StatusMessage>
            )}

            {deleteStatus && activeDialog !== 'delete' && (
                <StatusMessage danger>{deleteStatus}</StatusMessage>
            )}
        </>
    )
}

function StatusMessage({
    children,
    danger = false,
}: {
    children: ReactNode
    danger?: boolean
}) {
    return (
        <p
            className={cn(
                'flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300',
                danger &&
                    'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
            )}
        >
            {danger && <ShieldAlert size={16} />}
            {children}
        </p>
    )
}
