// ──────────────────────────────────────────────────────────────────────────────
// Schemas Zod de autenticación (usados por React Hook Form).
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

export const telefonoSchema = z.object({
  telefono: z
    .string()
    .regex(/^\d{8}$/u, 'Ingresa un número de 8 dígitos (sin +502).'),
});

export type TelefonoInput = z.infer<typeof telefonoSchema>;

export const codigoSchema = z.object({
  codigo: z.string().regex(/^\d{6}$/u, 'El código debe tener 6 dígitos.'),
});

export type CodigoInput = z.infer<typeof codigoSchema>;

export const dpiSchema = z.object({
  dpi: z
    .string()
    .regex(/^\d{13}$/u, 'El DPI debe tener 13 dígitos.'),
});

export type DPIInput = z.infer<typeof dpiSchema>;

export const perfilRegistroSchema = z.object({
  nombre: z.string().min(2, 'Ingresa un nombre válido.'),
  apellido: z.string().min(2, 'Ingresa un apellido válido.'),
  direccion: z.string().min(3, 'Ingresa tu dirección.'),
  departamento: z.string().min(2, 'Selecciona un departamento.'),
  municipio: z.string().min(2, 'Selecciona un municipio.'),
  rol: z.enum(['productor', 'comprador'], {
    errorMap: () => ({ message: 'Elige si quieres vender o comprar.' }),
  }),
});

export type PerfilRegistroInput = z.infer<typeof perfilRegistroSchema>;

export const perfilEditSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  direccion: z.string().min(3),
  departamento: z.string().min(2),
  municipio: z.string().min(2),
});

export type PerfilEditInput = z.infer<typeof perfilEditSchema>;
