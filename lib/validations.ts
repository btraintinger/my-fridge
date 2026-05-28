import { z } from 'zod'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Translator = (key: any, values?: any) => string

// ── Registration ────────────────────────────────────────────────────────────
export const createRegisterSchema = (t: Translator) =>
    z.object({
        name: z
            .string()
            .min(2, t('validation.name.min', { min: 2 }))
            .max(50, t('validation.name.max', { max: 50 }))
            .trim(),
        email: z
            .string()
            .min(1, t('validation.email.required'))
            .email(t('validation.email.invalid')),
        password: z
            .string()
            .min(8, t('validation.password.min', { min: 8 }))
            .regex(/[A-Z]/, t('validation.password.uppercase'))
            .regex(/[0-9]/, t('validation.password.digit'))
            .regex(/[^A-Za-z0-9]/, t('validation.password.symbol')),
    })

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>

// ── Login ───────────────────────────────────────────────────────────────────
export const createLoginSchema = (t: Translator) =>
    z.object({
        email: z
            .string()
            .min(1, t('validation.email.required'))
            .email(t('validation.email.invalid')),
        password: z.string().min(1, t('validation.password.required')),
    })

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>

// ── Create Fridge ───────────────────────────────────────────────────────────
export const createCreateFridgeSchema = (t: Translator) =>
    z.object({
        name: z
            .string()
            .min(2, t('validation.fridgeName.min', { min: 2 }))
            .max(60, t('validation.fridgeName.max', { max: 60 }))
            .trim(),
    })

export type CreateFridgeFormData = z.infer<
    ReturnType<typeof createCreateFridgeSchema>
>

// ── Share Fridge ────────────────────────────────────────────────────────────
export const createShareFridgeSchema = (t: Translator) =>
    z.object({
        email: z
            .string()
            .min(1, t('validation.email.required'))
            .email(t('validation.email.invalid'))
            .trim(),
    })

export type ShareFridgeFormData = z.infer<
    ReturnType<typeof createShareFridgeSchema>
>

// ── Shopping List Item ──────────────────────────────────────────────────────
export const createShoppingItemSchema = (t: Translator) =>
    z.object({
        name: z
            .string()
            .min(1, t('validation.shoppingItem.required'))
            .max(120, t('validation.shoppingItem.max', { max: 120 }))
            .trim(),
    })

export type ShoppingItemFormData = z.infer<
    ReturnType<typeof createShoppingItemSchema>
>

// ── Item Quantity ───────────────────────────────────────────────────────────
export const createItemQuantitySchema = (t: Translator) =>
    z.object({
        quantity: z
            .number({ error: t('validation.quantity.type') })
            .int(t('validation.quantity.int'))
            .min(1, t('validation.quantity.min', { min: 1 })),
    })

export type ItemQuantityFormData = z.infer<
    ReturnType<typeof createItemQuantitySchema>
>

// ── Manual Product ──────────────────────────────────────────────────────────
export const createManualProductSchema = (t: Translator) =>
    z.object({
        name: z
            .string()
            .min(1, t('validation.product.nameRequired'))
            .max(120, t('validation.product.nameMax', { max: 120 }))
            .trim(),
        quantity: z
            .number({ error: t('validation.quantity.type') })
            .int(t('validation.quantity.int'))
            .min(1, t('validation.quantity.min', { min: 1 })),
        category: z.string().min(1, t('validation.product.categoryRequired')),
        expiryDate: z.string().optional(),
        notes: z
            .string()
            .max(500, t('validation.product.notesMax', { max: 500 }))
            .optional(),
    })

export type ManualProductFormData = z.infer<
    ReturnType<typeof createManualProductSchema>
>
