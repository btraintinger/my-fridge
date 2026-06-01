import { useMemo, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { FridgeItem } from '@/lib/types'

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    dairy: [
        'milch', 'käse', 'joghurt', 'butter', 'sahne', 'quark',
        'milk', 'cheese', 'yogurt', 'dairy',
    ],
    meat: [
        'fleisch', 'wurst', 'schinken', 'hähnchen', 'rind', 'schwein',
        'meat', 'chicken', 'beef', 'pork', 'speck',
    ],
    veg: [
        'gemüse', 'tomate', 'gurke', 'paprika', 'salat', 'karotte',
        'vegetable', 'tomato', 'cucumber', 'pepper', 'salad', 'carrot',
        'zwiebel', 'knoblauch',
    ],
    fruit: [
        'obst', 'apfel', 'banane', 'orange', 'beere',
        'fruit', 'apple', 'banana', 'orange', 'berry', 'zitrone',
    ],
    drinks: [
        'saft', 'wasser', 'cola', 'limo', 'bier', 'wein',
        'drink', 'water', 'juice', 'beer', 'wine', 'getränk',
    ],
}

export function useFridgeProducts(items: FridgeItem[]) {
    const t = useTranslations()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        if (typeof window === 'undefined') return 'grid'
        return (localStorage.getItem('fridgeViewMode') as 'grid' | 'list') || 'grid'
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<string>(() => {
        if (typeof window === 'undefined') return 'name-asc'
        return localStorage.getItem('fridgeSortPreference') || 'name-asc'
    })
    const [filterCategory, setFilterCategory] = useState<string>('all')

    useEffect(() => {
        localStorage.setItem('fridgeViewMode', viewMode)
    }, [viewMode])

    useEffect(() => {
        localStorage.setItem('fridgeSortPreference', sortBy)
    }, [sortBy])

    const filteredAndSortedItems = useMemo(() => {
        let result = [...items]

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (item) =>
                    item.product.product_name?.toLowerCase().includes(query) ||
                    item.product.brands?.toLowerCase().includes(query)
            )
        }

        if (filterCategory !== 'all') {
            const keywords = CATEGORY_KEYWORDS[filterCategory]
            if (keywords) {
                result = result.filter((item) => {
                    const text =
                        `${item.product.product_name} ${item.product.ingredients} ${item.product.labels?.join(' ')}`.toLowerCase()
                    return keywords.some((kw) => text.includes(kw))
                })
            }
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return (a.product.product_name || '').localeCompare(b.product.product_name || '')
                case 'name-desc':
                    return (b.product.product_name || '').localeCompare(a.product.product_name || '')
                case 'category-asc':
                    return (a.product.category || '').localeCompare(b.product.category || '')
                case 'category-desc':
                    return (b.product.category || '').localeCompare(a.product.category || '')
                case 'quantity-asc':
                    return (a.quantity ?? 1) - (b.quantity ?? 1)
                case 'quantity-desc':
                    return (b.quantity ?? 1) - (a.quantity ?? 1)
                case 'nutri-asc': {
                    const gradeA = a.product.nutriscore_grade || 'z'
                    const gradeB = b.product.nutriscore_grade || 'z'
                    return gradeA.localeCompare(gradeB)
                }
                case 'nutri-desc': {
                    const gradeA = a.product.nutriscore_grade || 'a'
                    const gradeB = b.product.nutriscore_grade || 'a'
                    return gradeB.localeCompare(gradeA)
                }
                case 'expiry-asc': {
                    const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity
                    const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity
                    return dateA - dateB
                }
                case 'expiry-desc': {
                    const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : -Infinity
                    const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : -Infinity
                    return dateB - dateA
                }
                case 'added-desc': {
                    // Assuming there is no explicit added date, but we can sort by id or if it exists
                    // We'll leave it as a fallback to id string comparison which is roughly chronological in Firestore
                    return (b.id || '').localeCompare(a.id || '')
                }
                case 'added-asc': {
                    return (a.id || '').localeCompare(b.id || '')
                }
                default:
                    return 0
            }
        })

        return result
    }, [items, searchQuery, filterCategory, sortBy])

    const groupedItems = useMemo(() => {
        const groups: Record<string, FridgeItem[]> = {}
        filteredAndSortedItems.forEach((item) => {
            const cat = item.product.category || t('fridges.detail.categories.other')
            if (!groups[cat]) groups[cat] = []
            groups[cat].push(item)
        })
        return groups
    }, [filteredAndSortedItems, t])

    const CATEGORY_ORDER = [
        'Milchprodukte',
        'Fleisch & Fisch',
        'Gemüse & Obst',
        'Getränke',
        'Snacks & Süßes',
        'Tiefkühl',
        'Sonstiges',
        t('fridges.detail.categories.dairy'),
        t('fridges.detail.categories.meatFish'),
        t('fridges.detail.categories.vegFruit'),
        t('fridges.detail.categories.drinks'),
        t('fridges.detail.categories.snacks'),
        t('fridges.detail.categories.frozen'),
        t('fridges.detail.categories.other'),
    ]

    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        const idxA = CATEGORY_ORDER.indexOf(a)
        const idxB = CATEGORY_ORDER.indexOf(b)
        if (idxA === -1 && idxB === -1) return a.localeCompare(b)
        if (idxA === -1) return 1
        if (idxB === -1) return -1
        return idxA - idxB
    })

    return {
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        filterCategory,
        setFilterCategory,
        filteredAndSortedItems,
        groupedItems,
        sortedCategories,
    }
}
