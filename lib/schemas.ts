import { z } from 'zod'

export const NutrimentsSchema = z.object({
    energy_kcal: z.number().default(0),
    fat: z.number().default(0),
    saturated_fat: z.number().default(0),
    carbohydrates: z.number().default(0),
    sugars: z.number().default(0),
    proteins: z.number().default(0),
    salt: z.number().default(0),
    fiber: z.number().default(0),
})

export const DietaryFlagsSchema = z.object({
    vegan: z.boolean().nullable().default(null),
    vegetarian: z.boolean().nullable().default(null),
    palm_oil_free: z.boolean().nullable().default(null),
})

export const ProductSchema = z.object({
    barcode: z.string(),
    product_name: z.string().default('-'),
    brands: z.string().default('-'),
    image_url: z.string().default(''),
    nutriscore_grade: z.string().nullable().default(null),
    allergens: z.string().default(''),
    ingredients: z.string().default(''),
    origin_country: z.string().default(''),
    sold_in_countries: z.string().default(''),
    labels: z.array(z.string()).default([]),
    dietary_flags: DietaryFlagsSchema.default({
        vegan: null,
        vegetarian: null,
        palm_oil_free: null,
    }),
    nutriments: NutrimentsSchema,
    ecoscore_grade: z.string().nullable().default(null),
})

export const FridgeSchema = z.object({
    id: z.string(),
    name: z.string(),
    userId: z.string(),
    createdAt: z.any().optional(), // Firestore Timestamp
    sharedWithEmails: z.array(z.string()).optional().default([]),
    itemCount: z.number().optional(),
    modalNutriScore: z.string().nullable().optional(),
})

export const FridgeItemSchema = z.object({
    id: z.string(),
    fridgeId: z.string().optional(),
    userId: z.string().optional(),
    addedAt: z.any().optional(), // Firestore Timestamp
    quantity: z.number().int().positive().optional(),
    product: ProductSchema,
})

export const ShoppingListItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    fridgeId: z.string().optional(),
    userId: z.string(),
    checked: z.boolean().default(false),
    createdAt: z.any().optional(), // Firestore Timestamp
})

export const UserPreferencesSchema = z.object({
    userId: z.string(),
    darkMode: z.boolean().default(false),
    updatedAt: z.any().optional(), // Firestore Timestamp
})

export type Nutriments = z.infer<typeof NutrimentsSchema>
export type Product = z.infer<typeof ProductSchema>
export type Fridge = z.infer<typeof FridgeSchema>
export type FridgeItem = z.infer<typeof FridgeItemSchema>
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
