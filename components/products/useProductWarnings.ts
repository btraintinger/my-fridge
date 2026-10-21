import { useTranslations } from 'next-intl'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { getNutrimentWarnings } from '@/lib/products/nutrimentWarnings'
import { getMatchingAllergens } from '@/lib/products/allergenWarnings'
import { formatAllergenMatches } from '@/lib/products/dietaryPreferences'
import type { Product } from '@/lib/types'

export function useProductWarnings(product: Product | null) {
    const t = useTranslations()
    const { dietaryPreferences } = useUserPreferences()
    return {
        warnings: product ? getNutrimentWarnings(product) : [],
        allergenLabels: product
            ? formatAllergenMatches(
                  getMatchingAllergens(product, dietaryPreferences),
                  t
              ).join(', ')
            : '',
    }
}
