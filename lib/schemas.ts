import { z } from 'zod'

export const TimestampType = z.custom<{toDate:()=>Date}>((val) => {
    return val != null && typeof (val as { toDate?: unknown }).toDate === "function"
});

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
    category: z.string().default('Sonstiges'),
    unit: z.string().optional(),
})

export const FridgeSchema = z.object({
    id: z.string(),
    name: z.string(),
    userId: z.string(),
    createdAt: TimestampType.optional(),
    sharedWithEmails: z.array(z.string()).optional().default([]),
    itemCount: z.number().optional(),
    modalNutriScore: z.string().nullable().optional(),
})

export const FridgeItemSchema = z.object({
    id: z.string(),
    fridgeId: z.string().optional(),
    userId: z.string().optional(),
    addedAt: TimestampType.optional(),
    quantity: z.number().int().positive().optional(),
    unit: z.string().optional(),
    expiryDate: z.string().optional(),
    productId: z.string().optional(),
    notes: z.string().optional(),
    product: ProductSchema,
})

export const ShoppingListItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    fridgeId: z.string().optional(),
    userId: z.string(),
    checked: z.boolean().default(false),
    createdAt: TimestampType.optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
})

export const UserPreferencesSchema = z.object({
    userId: z.string(),
    darkMode: z.boolean().default(false),
    locale: z.enum(['en', 'de']).optional(),
    updatedAt: TimestampType.optional(),
})

export const FcmTokenDocSchema = z.object({
    userAgent: z.string(),
    createdAt: TimestampType,
    lastSeenAt: TimestampType,
})

export const NotificationDocSchema = z.object({
    id: z.string(),
    type: z.enum([
        'fridge_invite',
        'fridge_activity',
        'shopping_list_activity',
        'expiration_alert',
    ]),
    title: z.string(),
    body: z.string(),
    data: z.record(z.string(), z.string()),
    link: z.string().optional(),
    createdAt: TimestampType,
    readAt: TimestampType.nullable(),
})

export const NotificationPreferencesSchema = z.object({
    invites: z.boolean(),
    fridgeActivity: z.boolean(),
    shoppingList: z.boolean(),
    expirationAlerts: z.boolean(),
    expirationLeadDays: z.number(),
})

export type Nutriments = z.infer<typeof NutrimentsSchema>
export type Product = z.infer<typeof ProductSchema>
export type Fridge = z.infer<typeof FridgeSchema>
export type FridgeItem = z.infer<typeof FridgeItemSchema>
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
export type FcmTokenDoc = z.infer<typeof FcmTokenDocSchema>
export type NotificationDoc = z.infer<typeof NotificationDocSchema>
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>
