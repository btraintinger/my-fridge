'use client'

import { FormEvent, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { fridgeService } from '../../lib/services/fridgeService'
import { useFridges } from '../../hooks/useFridges'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Plus, Refrigerator } from 'lucide-react'
import { FridgeCard } from '../../components/fridges/FridgeCard'

export default function Fridges() {
    const { user } = useAuth()
    const { fridges, fridgeScores, loading } = useFridges()
    const [showCreate, setShowCreate] = useState(false)
    const [newFridgeName, setNewFridgeName] = useState('')

    const handleCreateFridge = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!user || !newFridgeName.trim()) return

        await fridgeService.createFridge(user.uid, newFridgeName)
        setNewFridgeName('')
        setShowCreate(false)
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="pt-12 px-6 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
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
                        onSubmit={handleCreateFridge}
                        className="flex gap-2 animate-in slide-in-from-top-4 fade-in duration-300"
                    >
                        <Input
                            placeholder="e.g. WG Kitchen, Office"
                            value={newFridgeName}
                            onChange={(e) => setNewFridgeName(e.target.value)}
                            autoFocus
                            className="flex-1"
                        />
                        <Button type="submit">Create</Button>
                    </form>
                )}
            </div>

            <div className="p-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    )
}
