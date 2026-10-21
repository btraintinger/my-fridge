'use client'

import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { FridgeItem } from '@/lib/types'
import { useProductGridSwipe } from '@/components/fridges/useProductGridSwipe'
import { ProductGridCard } from '@/components/fridges/ProductGridCard'

interface ProductGridViewProps {
    groupedItems: Record<string, FridgeItem[]>
    sortedCategories: string[]
    onItemClick: (item: FridgeItem) => void
    onDeleteRequest: (item: FridgeItem) => void
}

export function ProductGridView({
    groupedItems,
    sortedCategories,
    onItemClick,
    onDeleteRequest,
}: ProductGridViewProps) {
    const [expandedCategories, setExpandedCategories] = useState<
        Record<string, boolean>
    >({})
    const swipe = useProductGridSwipe({
        groupedItems,
        sortedCategories,
        onItemClick,
        onDeleteRequest,
    })

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [cat]: !prev[cat],
        }))
    }

    return (
        <div className="space-y-8">
            {sortedCategories.map((category) => (
                <Collapsible
                    key={category}
                    open={Boolean(expandedCategories[category])}
                    onOpenChange={() => toggleCategory(category)}
                    className="space-y-3"
                >
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            type="button"
                            className="w-full flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 border-b-4 border-slate-200 dark:border-slate-800 rounded-t-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-h-[48px]"
                        >
                            <div className="flex items-center gap-2">
                                {expandedCategories[category] ? (
                                    <ChevronDown
                                        size={20}
                                        className="text-slate-400"
                                    />
                                ) : (
                                    <ChevronRight
                                        size={20}
                                        className="text-slate-400"
                                    />
                                )}
                                <h4 className="font-bold text-slate-700 dark:text-slate-300">
                                    {category}
                                </h4>
                                <span className="ml-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-0.5 px-2 rounded-full">
                                    {groupedItems[category].length}
                                </span>
                            </div>
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-4 px-1 sm:px-2 relative">
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 rounded-b-xl shadow-inner pointer-events-none -z-10" />

                            {groupedItems[category].map((item) => (
                                <ProductGridCard
                                    key={item.id}
                                    item={item}
                                    onDeleteRequest={onDeleteRequest}
                                    swipe={swipe}
                                />
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    )
}
