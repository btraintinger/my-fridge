'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../contexts/AuthContext'
import { fridgeService } from '../../lib/services/fridgeService'
import { useFridges } from '../../hooks/useFridges'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { FormField } from '../../components/ui/FormField'
import { Plus, Refrigerator } from 'lucide-react'
import { FridgeCard } from '../../components/fridges/FridgeCard'
import { createFridgeSchema, type CreateFridgeFormData } from '../../lib/validations'
import toast from 'react-hot-toast'

export default function Fridges() {
    const { user } = useAuth()
    const { fridges, fridgeScores, loading } = useFridges()
    const [showCreate, setShowCreate] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<CreateFridgeFormData>({
        resolver: zodResolver(createFridgeSchema),
        mode: 'onChange',
        defaultValues: { name: '' },
    })

    const onCreateFridge = async (data: CreateFridgeFormData) => {
        if (!user) return

        try {
            await fridgeService.createFridge(user.uid, data.name)
            toast.success(`"${data.name}" wurde erstellt!`)
            reset()
            setShowCreate(false)
        } catch {
            toast.error('Kühlschrank konnte nicht erstellt werden.')
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-6 lg:pl-20 xl:pl-56">
            <div className="pt-safe">
            <div className="pt-12 px-4 sm:px-6 lg:px-8 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        My Fridges
                    </h1>
                    <Button
                        size="sm"
                        onClick={() => setShowCreate(!showCreate)}
                        className="rounded-xl"
                    >
                        <Plus size={20} className="mr-1" />
                        New
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
                                    placeholder="e.g. WG Kitchen, Office"
                                    error={!!errors.name}
                                    autoFocus
                                    {...register('name')}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isValid}
                            >
                                {isSubmitting ? '...' : 'Create'}
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
                            No fridges yet
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
                            Create your first fridge to start tracking your
                            groceries and reducing waste.
                        </p>
                        <Button onClick={() => setShowCreate(true)} size="lg">
                            Create a Fridge
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {fridges.map((fridge) => (
                            <FridgeCard
                                key={fridge.id}
                                fridge={fridge}
                                score={fridgeScores[fridge.id]}
                            />
                        ))}
                    </div>
                )}
                </div>
            </div>
        </div>
    )
}
