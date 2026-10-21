'use client'

import { useTranslations } from 'next-intl'
import {
    LayoutGrid,
    List as ListIcon,
    Search,
    Filter,
    ArrowUpDown,
} from 'lucide-react'
import type { FridgeItem } from '@/lib/types'
import { useFridgeProducts } from '@/components/fridges/useFridgeProducts'
import { PRODUCT_CATEGORIES } from '@/lib/products/productCategories'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/feedback/States'
import { Select } from '@/components/forms/SelectField'
import { ProductGridView } from './ProductGridView'
import { ProductListView } from './ProductListView'

interface FridgeViewProps {
    items: FridgeItem[]
    onItemClick: (item: FridgeItem) => void
    onDeleteRequest: (item: FridgeItem) => void
    onQuantityChange: (itemId: string, quantity: number) => Promise<void>
    onExpiryDateChange: (itemId: string, date: string) => Promise<void>
}

export function FridgeView({
    items,
    onItemClick,
    onDeleteRequest,
    onQuantityChange,
    onExpiryDateChange,
}: FridgeViewProps) {
    const t = useTranslations()

    const {
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
    } = useFridgeProducts(items)

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-auto sm:flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <Input
                            type="text"
                            placeholder={t('fridges.detail.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 py-2 text-sm rounded-xl w-full"
                        />
                    </div>
                    <ToggleGroup
                        type="single"
                        value={viewMode}
                        spacing={1}
                        onValueChange={(value) => {
                            if (value === 'grid' || value === 'list')
                                setViewMode(value)
                        }}
                        className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0 w-full sm:w-auto"
                    >
                        <ToggleGroupItem
                            value="grid"
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <LayoutGrid size={16} />
                            {t('fridges.detail.view.categories')}
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="list"
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <ListIcon size={16} />
                            {t('fridges.detail.view.list')}
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select
                        size="sm"
                        className="flex-1"
                        value={filterCategory}
                        onChange={setFilterCategory}
                        icon={<Filter size={16} />}
                        options={[
                            {
                                value: 'all',
                                label: t(
                                    'fridges.detail.filters.allCategories'
                                ),
                            },
                            ...PRODUCT_CATEGORIES.map((category) => ({
                                value: category,
                                label: t(
                                    `fridges.detail.categories.${category}`
                                ),
                            })),
                        ]}
                    />
                    <Select
                        size="sm"
                        className="flex-1"
                        value={sortBy}
                        onChange={setSortBy}
                        icon={<ArrowUpDown size={16} />}
                        options={[
                            {
                                value: 'name-asc',
                                label: t('fridges.detail.sort.nameAsc'),
                            },
                            {
                                value: 'name-desc',
                                label: t('fridges.detail.sort.nameDesc'),
                            },
                            {
                                value: 'category-asc',
                                label: t('fridges.detail.sort.categoryAsc'),
                            },
                            {
                                value: 'quantity-desc',
                                label: t('fridges.detail.sort.quantityDesc'),
                            },
                            {
                                value: 'nutri-asc',
                                label: t('fridges.detail.sort.nutriAsc'),
                            },
                            {
                                value: 'expiry-asc',
                                label: t('fridges.detail.sort.expiryAsc'),
                            },
                            {
                                value: 'added-desc',
                                label: t('fridges.detail.sort.addedDesc'),
                            },
                        ]}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        {t('fridges.detail.inventory')}
                    </h3>
                </div>

                {filteredAndSortedItems.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title={
                            items.length === 0
                                ? t('fridges.detail.emptyFridge')
                                : t('fridges.detail.noResults')
                        }
                        className="bg-card rounded-4xl p-16 md:p-16 border-2 border-dashed border-border [&_[data-slot=empty-icon]]:size-20 [&_[data-slot=empty-icon]]:rounded-full [&_[data-slot=empty-icon]]:bg-muted [&_[data-slot=empty-title]]:text-muted-foreground"
                    />
                ) : viewMode === 'grid' ? (
                    <ProductGridView
                        groupedItems={groupedItems}
                        sortedCategories={sortedCategories}
                        onItemClick={onItemClick}
                        onDeleteRequest={onDeleteRequest}
                    />
                ) : (
                    <ProductListView
                        items={filteredAndSortedItems}
                        onItemClick={onItemClick}
                        onDeleteRequest={onDeleteRequest}
                        onQuantityChange={onQuantityChange}
                        onExpiryDateChange={onExpiryDateChange}
                    />
                )}
            </div>
        </div>
    )
}
