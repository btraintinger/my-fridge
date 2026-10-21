export const PRODUCT_CATEGORIES = [
    'dairy',
    'meatFish',
    'vegFruit',
    'drinks',
    'snacks',
    'frozen',
    'other',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

type CategoryRule = {
    category: ProductCategory
    terms: readonly string[]
}

// OFF supplies taxonomy ancestors alongside specific tags. Match whole tags,
// not ingredient words inside tags such as "milk-chocolates" or "cream-sauces".
// Storage and product type take precedence over ingredient-based ancestors.
const TAG_RULES: readonly CategoryRule[] = [
    {
        category: 'frozen',
        terms: [
            'frozen-foods',
            'ice-creams',
            'ice-creams-and-sorbets',
            'sorbets',
        ],
    },
    {
        category: 'drinks',
        terms: [
            'beverages',
            'alcoholic-beverages',
            'non-alcoholic-beverages',
            'waters',
            'fruit-juices',
            'plant-based-beverages',
            'plant-milks',
            'milk-substitutes',
            'soft-drinks',
            'beers',
            'wines',
        ],
    },
    {
        category: 'snacks',
        terms: [
            'snacks',
            'sweet-snacks',
            'salty-snacks',
            'confectioneries',
            'chocolates',
            'milk-chocolates',
            'dark-chocolates',
            'white-chocolates',
            'chocolate-bars',
            'biscuits',
            'biscuits-and-cakes',
            'cakes',
            'candies',
            'crisps',
            'cereal-bars',
            'pastries',
        ],
    },
    {
        category: 'other',
        terms: [
            'meat-substitutes',
            'dairy-substitutes',
            'plant-based-cheeses',
            'plant-based-yogurts',
        ],
    },
    {
        category: 'meatFish',
        terms: [
            'meats',
            'meat-products',
            'poultry',
            'fishes',
            'fish-products',
            'seafood',
            'seafoods',
            'sausages',
            'hams',
        ],
    },
    {
        category: 'dairy',
        terms: [
            'dairies',
            'dairy',
            'milks',
            'cheeses',
            'yogurts',
            'butters',
            'creams',
            'fermented-milk-products',
            'dairy-desserts',
            'quarks',
        ],
    },
    {
        category: 'vegFruit',
        terms: [
            'fruits-and-vegetables',
            'fruits',
            'vegetables',
            'legumes',
            'fresh-fruits',
            'fresh-vegetables',
        ],
    },
    {
        category: 'other',
        terms: [
            'sauces',
            'spreads',
            'cereals-and-their-products',
            'oils',
            'breads',
        ],
    },
]

const tagRules = TAG_RULES.map((rule) => ({
    category: rule.category,
    terms: new Set(rule.terms.map((term) => `en:${term}`)),
}))

export function categorizeProduct(tags: readonly string[]): ProductCategory {
    // Only canonical English taxonomy IDs participate in categorization.
    const englishTags = tags.filter((tag) => tag.startsWith('en:'))

    // Frozen subcategories need not include the generic ancestor in sparse data.
    if (englishTags.some((tag) => tag.startsWith('en:frozen-'))) return 'frozen'

    for (const rule of tagRules) {
        if (englishTags.some((tag) => rule.terms.has(tag))) return rule.category
    }
    return 'other'
}
