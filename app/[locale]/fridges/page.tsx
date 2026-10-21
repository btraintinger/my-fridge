'use client'

import { PageShell, PageHeader } from '@/components/layout/Page'
import { Spinner } from '@/components/feedback/Spinner'
import { useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { createFridge } from '@/lib/services/fridgeService'
import { useFridges } from '@/components/fridges/useFridges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/feedback/States'
import { Plus, Refrigerator } from 'lucide-react'
import { FridgeCard } from '@/components/fridges/FridgeCard'
import {
    createCreateFridgeSchema,
    type CreateFridgeFormData,
} from '@/lib/validations'
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
        } catch {}
    }

    if (loading || (!skipAutoSelect && fridges.length === 1)) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <Spinner className="w-10 h-10" />
            </div>
        )
    }

    return (
        <PageShell>
            <PageHeader
                icon={Refrigerator}
                title={t('fridges.list.title')}
                subtitle={t('fridges.list.subtitle')}
                contentClassName="mb-6"
                actions={
                    <Button
                        size="sm"
                        onClick={() => setShowCreate(!showCreate)}
                        className="rounded-xl shrink-0"
                    >
                        <Plus size={20} className="mr-1" />
                        {t('fridges.list.newButton')}
                    </Button>
                }
            >
                {showCreate && (
                    <form
                        onSubmit={handleSubmit(onCreateFridge)}
                        className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-2"
                    >
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder={t(
                                        'fridges.list.namePlaceholder'
                                    )}
                                    aria-invalid={!!errors.name}
                                    autoFocus
                                    {...register('name')}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isValid}
                            >
                                {isSubmitting
                                    ? t('fridges.list.creating')
                                    : t('fridges.list.createSubmit')}
                            </Button>
                        </div>
                        {errors.name && (
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 ml-1 animate-in fade-in duration-200">
                                {errors.name.message}
                            </p>
                        )}
                    </form>
                )}
            </PageHeader>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="content-container">
                    {fridges.length === 0 && !showCreate ? (
                        <EmptyState
                            size="lg"
                            icon={Refrigerator}
                            title={t('fridges.list.emptyTitle')}
                            description={t('fridges.list.emptyMessage')}
                            className="animate-in fade-in zoom-in duration-500"
                            action={
                                <Button
                                    onClick={() => setShowCreate(true)}
                                    size="lg"
                                >
                                    {t('fridges.list.createCta')}
                                </Button>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {fridges.map((fridge) => (
                                <FridgeCard key={fridge.id} fridge={fridge} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    )
}
