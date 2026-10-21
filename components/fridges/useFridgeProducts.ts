import { useMemo, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { FridgeItem } from '@/lib/types'
import {
    PRODUCT_CATEGORIES,
    getProductCategoryLabel,
    matchesProductCategory,
} from '@/lib/products/productCategories'

export function useFridgeProducts(items: FridgeItem[]) {
    const t = useTranslations()

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        if (typeof window === 'undefined') return 'grid'
        return (
            (localStorage.getItem('fridgeViewMode') as 'grid' | 'list') ||
            'grid'
        )
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

        result = result.filter((item) =>
            matchesProductCategory(item.product.category, filterCategory)
        )

        result.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return (a.product.product_name || '').localeCompare(
                        b.product.product_name || ''
                    )
                case 'name-desc':
                    return (b.product.product_name || '').localeCompare(
                        a.product.product_name || ''
                    )
                case 'category-asc':
                    return getProductCategoryLabel(
                        a.product.category,
                        t
                    ).localeCompare(
                        getProductCategoryLabel(b.product.category, t)
                    )
                case 'category-desc':
                    return getProductCategoryLabel(
                        b.product.category,
                        t
                    ).localeCompare(
                        getProductCategoryLabel(a.product.category, t)
                    )
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
                    const dateA = a.expiryDate
                        ? new Date(a.expiryDate).getTime()
                        : Infinity
                    const dateB = b.expiryDate
                        ? new Date(b.expiryDate).getTime()
                        : Infinity
                    return dateA - dateB
                }
                case 'expiry-desc': {
                    const dateA = a.expiryDate
                        ? new Date(a.expiryDate).getTime()
                        : -Infinity
                    const dateB = b.expiryDate
                        ? new Date(b.expiryDate).getTime()
                        : -Infinity
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
    }, [items, searchQuery, filterCategory, sortBy, t])

    const groupedItems = useMemo(() => {
        const groups: Record<string, FridgeItem[]> = {}
        filteredAndSortedItems.forEach((item) => {
            const cat = getProductCategoryLabel(item.product.category, t)
            if (!groups[cat]) groups[cat] = []
            groups[cat].push(item)
        })
        return groups
    }, [filteredAndSortedItems, t])

    const CATEGORY_ORDER = PRODUCT_CATEGORIES.map((key) =>
        t(`fridges.detail.categories.${key}`)
    )

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
