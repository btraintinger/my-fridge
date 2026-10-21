'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { UserPlus, X, User, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TooltipButton } from '@/components/feedback/TooltipButton'
import { shareFridge, unshareFridge } from '@/lib/services/fridgeService'
import { createShareFridgeSchema } from '@/lib/validations'
import { FormField } from '@/components/forms/FormField'
import type { Fridge } from '@/lib/types'

interface ShareFridgePanelProps {
    fridgeId: string
    fridge: Fridge
    open: boolean
    onClose: () => void
}

export function ShareFridgePanel({
    fridgeId,
    fridge,
    open,
    onClose,
}: ShareFridgePanelProps) {
    const t = useTranslations()
    const { user } = useAuth()
    const [shareEmail, setShareEmail] = useState('')
    const [sharing, setSharing] = useState(false)
    const [emailError, setEmailError] = useState('')
    const shareFridgeSchema = useMemo(() => createShareFridgeSchema(t), [t])

    const handleShare = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!user || !fridge || fridge.userId !== user.uid) return

        setEmailError('')
        const parsed = shareFridgeSchema.safeParse({ email: shareEmail })
        if (!parsed.success) {
            setEmailError(parsed.error.issues[0].message)
            return
        }

        setSharing(true)
        try {
            await shareFridge(fridgeId, parsed.data.email)
            setShareEmail('')
            onClose()
        } finally {
            setSharing(false)
        }
    }

    const handleUnshare = async (email: string) => {
        if (!user || !fridge || fridge.userId !== user.uid) return
        await unshareFridge(fridgeId, email)
    }

    if (!open || fridge.userId !== user?.uid) return null

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-emerald-100 dark:border-emerald-900/30 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <UserPlus size={24} className="text-emerald-500" />
                    {t('fridges.detail.shareHeading')}
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => onClose()}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                    <X size={20} />
                </Button>
            </div>

            <form
                onSubmit={handleShare}
                noValidate
                className="flex items-start gap-2 mb-6"
            >
                <div className="flex-1 min-w-0">
                    <FormField
                        label={t('auth.fields.email')}
                        required
                        error={emailError || undefined}
                    >
                        {(fieldProps) => (
                            <Input
                                {...fieldProps}
                                type="email"
                                placeholder={t(
                                    'fridges.detail.shareEmailPlaceholder'
                                )}
                                value={shareEmail}
                                onChange={(e) => {
                                    setShareEmail(e.target.value)
                                    setEmailError('')
                                }}
                            />
                        )}
                    </FormField>
                </div>
                <Button type="submit" disabled={sharing} className="mt-6">
                    {sharing ? '...' : t('common.invite')}
                </Button>
            </form>

            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                    {t('fridges.detail.sharedWith')}
                </h3>
                {!fridge.sharedWithEmails ||
                fridge.sharedWithEmails.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic px-1">
                        {t('fridges.detail.noOneYet')}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {fridge.sharedWithEmails.map((email) => (
                            <div
                                key={email}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-none">
                                        {email}
                                    </span>
                                </div>
                                <TooltipButton
                                    aria-label={t(
                                        'fridges.detail.removeAccess'
                                    )}
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={() => handleUnshare(email)}
                                    className="text-slate-300 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                                    tooltip={t('fridges.detail.removeAccess')}
                                >
                                    <Trash2 size={18} />
                                </TooltipButton>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
