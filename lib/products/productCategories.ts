import type { ProductCategory } from '@/lib/products/productCategorization'

export {
    PRODUCT_CATEGORIES,
    type ProductCategory,
} from '@/lib/products/productCategorization'

export function matchesProductCategory(
    category: ProductCategory,
    filter: string
): boolean {
    return filter === 'all' || category === filter
}

export function getProductCategoryLabel(
    category: ProductCategory,
    t: (key: `fridges.detail.categories.${ProductCategory}`) => string
) {
    return t(`fridges.detail.categories.${category}`)
}

export function getProductLabel(label: string, manualLabel: string) {
    return label === 'manual' ? manualLabel : label
}
