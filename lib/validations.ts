import { z } from 'zod'

// ── Registration ────────────────────────────────────────────────────────────
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name muss mindestens 2 Zeichen lang sein.')
        .max(50, 'Name darf maximal 50 Zeichen lang sein.')
        .trim(),
    email: z
        .string()
        .min(1, 'E-Mail ist erforderlich.')
        .email('Bitte gib eine gültige E-Mail-Adresse ein.'),
    password: z
        .string()
        .min(8, 'Passwort muss mindestens 8 Zeichen lang sein.')
        .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten.')
        .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten.')
        .regex(
            /[^A-Za-z0-9]/,
            'Passwort muss mindestens ein Sonderzeichen enthalten.'
        ),
})

export type RegisterFormData = z.infer<typeof registerSchema>

// ── Login ───────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'E-Mail ist erforderlich.')
        .email('Bitte gib eine gültige E-Mail-Adresse ein.'),
    password: z.string().min(1, 'Passwort ist erforderlich.'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ── Create Fridge ───────────────────────────────────────────────────────────
export const createFridgeSchema = z.object({
    name: z
        .string()
        .min(2, 'Kühlschrank-Name muss mindestens 2 Zeichen lang sein.')
        .max(60, 'Kühlschrank-Name darf maximal 60 Zeichen lang sein.')
        .trim(),
})

export type CreateFridgeFormData = z.infer<typeof createFridgeSchema>

// ── Manual Product ──────────────────────────────────────────────────────────
export const manualProductSchema = z.object({
    name: z
        .string()
        .min(1, 'Produktname ist erforderlich.')
        .max(120, 'Produktname darf maximal 120 Zeichen lang sein.')
        .trim(),
    quantity: z
        .number({ error: 'Menge muss eine Zahl sein.' })
        .int('Menge muss eine ganze Zahl sein.')
        .min(1, 'Menge muss mindestens 1 sein.'),
    category: z.string().min(1, 'Kategorie ist erforderlich.'),
    expiryDate: z.string().optional(),
    notes: z.string().max(500, 'Notizen dürfen maximal 500 Zeichen lang sein.').optional(),
})

export type ManualProductFormData = z.infer<typeof manualProductSchema>
