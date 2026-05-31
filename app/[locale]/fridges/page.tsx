'use client'

import { useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { createFridge } from '@/lib/services/fridgeService'
import { useFridges } from '@/hooks/useFridges'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Refrigerator } from 'lucide-react'
import { FridgeCard } from '@/components/fridges/FridgeCard'
import { createCreateFridgeSchema, type CreateFridgeFormData } from '@/lib/validations'
import { useRouter } from '@/i18n/navigation'

export default function Fridges() {
    const t = useTranslations()
    const { user } = useAuth()
    const { fridges, loading } = useFridges()
    const [showCreate, setShowCreate] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const skipAutoSelect = searchParams.get('list') === '1'
    const schema = useMemo(() => createCreateFridgeSchema(t), [t])

    useEffect(() => {
        if (!skipAutoSelect && !loading && fridges.length === 1) {
            router.replace(`/fridges/${fridges[0].id}`)
        }
    }, [skipAutoSelect, loading, fridges, router])

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<CreateFridgeFormData>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: { name: '' },
    })

    const onCreateFridge = async (data: CreateFridgeFormData) => {
        if (!user) return
        try {
            await createFridge(user.uid, data.name)
            reset()
            setShowCreate(false)
        } catch {
        }
    }

    if (loading || (!skipAutoSelect && fridges.length === 1)) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-6 lg:pl-20 xl:pl-56">
            <div className="pt-safe">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 pb-5 pt-12 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
                <div className="flex justify-between items-center gap-3 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Refrigerator size={22} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                                {t('fridges.list.title')}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('fridges.list.subtitle')}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShowCreate(!showCreate)}
                        className="rounded-xl shrink-0"
                    >
                        <Plus size={20} className="mr-1" />
                        {t('fridges.list.newButton')}
                    </Button>
                </div>

                {showCreate && (
                    <form
                        onSubmit={handleSubmit(onCreateFridge)}
                        className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-2"
                    >
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder={t('fridges.list.namePlaceholder')}
                                    error={!!errors.name}
                                    autoFocus
                                    {...register('name')}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isValid}
                            >
                                {isSubmitting ? t('fridges.list.creating') : t('fridges.list.createSubmit')}
                            </Button>
                        </div>
                        {errors.name && (
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 ml-1 animate-in fade-in duration-200">
                                {errors.name.message}
                            </p>
                        )}
                    </form>
                )}
            </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="content-container">
                {fridges.length === 0 && !showCreate ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
                            <Refrigerator size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                            {t('fridges.list.emptyTitle')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
                            {t('fridges.list.emptyMessage')}
                        </p>
                        <Button onClick={() => setShowCreate(true)} size="lg">
                            {t('fridges.list.createCta')}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {fridges.map((fridge) => (
                            <FridgeCard
                                key={fridge.id}
                                fridge={fridge}
                            />
                        ))}
                    </div>
                )}
                </div>
            </div>
        </div>
    )
}
