import { z } from 'zod';

// Schema de validación para Login
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'El email es obligatorio')
        .email('Email inválido'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

// Schema de validación para Registro
export const registroSchema = z.object({
    email: z
        .string()
        .min(1, 'El email es obligatorio')
        .email('Email inválido')
        .toLowerCase(),
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número')
});

// Types exportados
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistroFormData = z.infer<typeof registroSchema>;
