'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import type { Product } from '../lib/types'

const CATEGORIES = [
    'Milchprodukte',
    'Fleisch & Fisch',
    'Gemüse & Obst',
    'Snacks & Süßes',
    'Getränke',
    'Tiefkühl',
    'Sonstiges',
]

interface ManualProductModalProps {
    onClose: () => void
    onSubmit: (
        product: Product,
        options: { quantity: number; expiryDate?: string; notes?: string }
    ) => Promise<void>
}

export function ManualProductModal({ onClose, onSubmit }: ManualProductModalProps) {
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [category, setCategory] = useState(CATEGORIES[0])
    const [expiryDate, setExpiryDate] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            const dummyProduct: Product = {
                barcode: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                product_name: name.trim(),
                brands: '-',
                labels: ['Manuell'],
                image_url: '',
                nutriscore_grade: null,
                allergens: '',
                ingredients: '',
                origin_country: '',
                sold_in_countries: '',
                dietary_flags: { vegan: null, vegetarian: null, palm_oil_free: null },
                nutriments: {
                    energy_kcal: 0,
                    fat: 0,
                    saturated_fat: 0,
                    carbohydrates: 0,
                    sugars: 0,
                    proteins: 0,
                    salt: 0,
                    fiber: 0,
                },
                ecoscore_grade: null,
                category: category,
            }

            await onSubmit(dummyProduct, {
                quantity,
                expiryDate: expiryDate || undefined,
                notes: notes.trim() || undefined,
            })
            onClose()
        } catch (error) {
            console.error('Failed to add manual product', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full duration-300 border-x border-t sm:border border-white/10">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Produkt manuell anlegen</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Produktname *</label>
                        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Äpfel vom Markt" className="h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Menge *</label>
                            <Input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="h-12" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategorie</label>
                            <select
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ablaufdatum (Optional)</label>
                        <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="h-12" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notizen (Optional)</label>
                        <textarea
                            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Weitere Details zum Produkt..."
                        />
                    </div>
                    <div className="pt-2">
                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base">
                            In den Kühlschrank legen
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
