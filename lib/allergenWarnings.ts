import type { Product } from './types'
import type { DietaryPreferences } from './schemas'

// Maps boolean dietary flags to allergen terms found in OpenFoodFacts data.
// Returns flag key strings (e.g. "lactoseFree") so the UI can translate them.
const FLAG_TERMS: Partial<
    Record<keyof DietaryPreferences, { terms: string[] }>
> = {
    lactoseFree: {
        terms: [
            'milk',
            'lactose',
            'dairy',
            'cream',
            'butter',
            'cheese',
            'whey',
            'casein',
            'yogurt',
            'milch',
            'laktose',
        ],
    },
    glutenFree: {
        terms: [
            'gluten',
            'wheat',
            'barley',
            'rye',
            'oat',
            'spelt',
            'weizen',
            'gerste',
            'roggen',
            'hafer',
            'dinkel',
        ],
    },
    nutFree: {
        terms: [
            'nut',
            'nuts',
            'peanut',
            'almond',
            'cashew',
            'hazelnut',
            'walnut',
            'pistachio',
            'pecan',
            'macadamia',
            'nuss',
            'erdnuss',
            'mandel',
            'haselnuss',
        ],
    },
    vegan: {
        terms: [
            'milk',
            'egg',
            'eggs',
            'dairy',
            'lactose',
            'cream',
            'butter',
            'cheese',
            'whey',
            'casein',
            'gelatin',
            'honey',
            'fish',
            'shellfish',
            'crustaceans',
            'milch',
            'ei',
            'eier',
            'gelatine',
            'honig',
            'fisch',
        ],
    },
    vegetarian: {
        terms: [
            'meat',
            'fish',
            'shellfish',
            'crustaceans',
            'gelatin',
            'anchov',
            'fleisch',
            'fisch',
            'gelatine',
        ],
    },
}

function parseProductTokens(allergens: string): string[] {
    return allergens
        .split(',')
        .map((t) =>
            t
                .trim()
                .replace(/^[a-z]{2}:/, '')
                .toLowerCase()
        )
        .filter(Boolean)
}

function tokenMatches(tokens: string[], term: string): boolean {
    return tokens.some((token) => token.includes(term) || term.includes(token))
}

/**
 * Returns matched labels for display. Each entry is either:
 * - a dietary flag key (e.g. "lactoseFree") → caller should translate via settings.dietary.*
 * - a custom allergy string → display as-is
 */
export function getMatchingAllergens(
    product: Product,
    preferences: Pick<DietaryPreferences, keyof typeof FLAG_TERMS | 'allergies'>
): string[] {
    if (!product.allergens) return []

    const tokens = parseProductTokens(product.allergens)
    if (tokens.length === 0) return []

    const matched: string[] = []

    for (const [flag, config] of Object.entries(FLAG_TERMS) as [
        keyof typeof FLAG_TERMS,
        { terms: string[] },
    ][]) {
        const isActive = preferences[flag as keyof typeof preferences]
        if (!isActive) continue
        const hit = config.terms.some((term) => tokenMatches(tokens, term))
        if (hit) matched.push(flag)
    }

    for (const allergy of preferences.allergies ?? []) {
        const normalized = allergy.trim().toLowerCase()
        if (!normalized) continue
        if (tokenMatches(tokens, normalized)) matched.push(allergy)
    }

    return [...new Set(matched)]
}
