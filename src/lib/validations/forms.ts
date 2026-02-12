import { z } from "zod";

export const eventoSchema = z.object({
    titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    fecha_inicio: z.string().datetime({ message: "Fecha de inicio inválida" }),
    fecha_fin: z.string().datetime().nullable().optional(),
    ubicacion: z.string().min(2, "La ubicación es obligatoria"),
    tipo: z.enum(["Ensayo", "Salida", "Igualá", "Otro"], {
        errorMap: () => ({ message: "Tipo de evento no válido" })
    }),
    descripcion: z.string().optional(),
});

export const costaleroSchema = z.object({
    nombre: z.string().min(2, "El nombre es obligatorio"),
    apellidos: z.string().min(2, "Los apellidos son obligatorios"),
    apodo: z.string().optional().nullable(),
    email: z.string().email("Email inválido").optional().or(z.literal("")).nullable(),
    altura: z.number().positive("La altura debe ser positiva").optional().nullable(),
    trabajadera: z.number().int().min(1).max(7, "La trabajadera debe estar entre 1 y 7").optional(),
    puesto: z.string().min(2, "El puesto es obligatorio").optional(),
    suplemento: z.number().min(0).optional().nullable(),
    ano_ingreso: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
});

export type EventoValues = z.infer<typeof eventoSchema>;
export type CostaleroValues = z.infer<typeof costaleroSchema>;
