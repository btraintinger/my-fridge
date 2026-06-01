import { z } from 'zod'
import { zodConverter } from './zodConverter'

// Accepts:
// - Firestore Timestamps (read path: has toDate/toMillis)
// - FieldValue sentinels like serverTimestamp() (write path: opaque object)
// - null (transient local state for pending serverTimestamp writes, before the
//   server resolves the placeholder to a real Timestamp)
export const TimestampType = z.custom<{
    toDate?(): Date
    toMillis?(): number
} | null>((val) => val === null || typeof val === 'object')

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
    // Cache metadata — only set by client-side cache writes.
    updatedAt: TimestampType.optional(),
})

// `id` is injected by the converter on read; absent on write (Firestore auto-assigns).
export const FridgeSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    userId: z.string(),
    createdAt: TimestampType.optional(),
    sharedWithEmails: z.array(z.string()).optional().default([]),
    itemCount: z.number().optional(),
    // Sum of quantities per nutri-grade. Maintained via FieldValue.increment on
    // each item mutation; the displayed "modal" grade is derived from this.
    gradeCounts: z.record(z.string(), z.number()).optional(),
    // Legacy: pre-gradeCounts fridges still have this written by older clients.
    modalNutriScore: z.string().nullable().optional(),
})

// Embedded product snapshot — captured at add time and never re-fetched.
// Fridge reads should never touch the `/products` cache or OFF; stale is OK.
export const FridgeItemSchema = z.object({
    id: z.string().optional(),
    fridgeId: z.string().optional(),
    userId: z.string().optional(),
    addedAt: TimestampType.optional(),
    quantity: z.number().int().positive().optional(),
    unit: z.string().optional(),
    expiryDate: z.string().optional(),
    notes: z.string().optional(),
    product: ProductSchema,
})

export const ShoppingListItemSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    fridgeId: z.string().optional(),
    userId: z.string(),
    checked: z.boolean().default(false),
    createdAt: TimestampType.optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
})

export const NotificationPreferencesSchema = z.object({
    invites: z.boolean(),
    fridgeActivity: z.boolean(),
    shoppingList: z.boolean(),
    expirationAlerts: z.boolean(),
    expirationLeadDays: z.number(),
})

export const UserPreferencesSchema = z.object({
    userId: z.string(),
    darkMode: z.boolean().default(false),
    locale: z.enum(['en', 'de']).optional(),
    updatedAt: TimestampType.optional(),
    notificationPreferences: NotificationPreferencesSchema.optional(),
})

export const FcmTokenDocSchema = z.object({
    userAgent: z.string(),
    createdAt: TimestampType,
    lastSeenAt: TimestampType,
})

export const NotificationDocSchema = z.object({
    id: z.string().optional(),
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

export type Nutriments = z.infer<typeof NutrimentsSchema>
export type Product = z.infer<typeof ProductSchema>
export type Fridge = z.infer<typeof FridgeSchema>
export type FridgeItem = z.infer<typeof FridgeItemSchema>
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>
export type NotificationPreferences = z.infer<
    typeof NotificationPreferencesSchema
>
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
export type FcmTokenDoc = z.infer<typeof FcmTokenDocSchema>
export type NotificationDoc = z.infer<typeof NotificationDocSchema>

// Converters — attach to refs via .withConverter() for type-safe, validated I/O.
export const fridgeConverter = zodConverter(FridgeSchema)
export const fridgeItemConverter = zodConverter(FridgeItemSchema)
export const shoppingListItemConverter = zodConverter(ShoppingListItemSchema)
export const userPreferencesConverter = zodConverter(UserPreferencesSchema)
export const productConverter = zodConverter(ProductSchema)
export const fcmTokenConverter = zodConverter(FcmTokenDocSchema)
export const notificationConverter = zodConverter(NotificationDocSchema)
