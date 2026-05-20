// ──────────────────────────────────────────────────────────────────────────────
// Schema de producto — valida DA-02 (campos obligatorios + imágenes 1..5).
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';
import type { Categoria, UnidadMedida } from '../types';

export const CATEGORIAS: Categoria[] = [
  'Hortalizas',
  'Granos Básicos',
  'Frutas',
  'Tubérculos',
  'Hierbas',
  'Lácteos',
];

export const UNIDADES: UnidadMedida[] = ['lb', 'kg', 'quintal', 'manojo', 'unidad', 'docena'];

export const productoSchema = z
  .object({
    nombre: z.string().min(3, 'Ingresa un nombre de al menos 3 caracteres.'),
    categoria: z.enum(CATEGORIAS as [Categoria, ...Categoria[]], {
      errorMap: () => ({ message: 'Selecciona una categoría.' }),
    }),
    descripcion: z.string().min(10, 'Describe el producto con al menos 10 caracteres.'),
    precioUnitario: z.coerce.number().positive('El precio unitario debe ser mayor a 0.'),
    precioMayor: z.coerce.number().positive('El precio por mayor debe ser mayor a 0.'),
    cantidadMayor: z.coerce.number().int().positive('Define a partir de cuántas unidades aplica el precio por mayor.'),
    cantidadDisponible: z.coerce.number().int().nonnegative('La cantidad disponible no puede ser negativa.'),
    unidadMedida: z.enum(UNIDADES as [UnidadMedida, ...UnidadMedida[]]),
    imagenes: z
      .array(z.string().min(1))
      .min(1, 'Agrega al menos una imagen del producto.')
      .max(5, 'Máximo 5 imágenes por producto.'),
    tiposEntrega: z
      .array(z.enum(['recoger', 'delivery']))
      .min(1, 'Selecciona al menos un tipo de entrega.'),
  })
  .refine((v) => v.precioMayor <= v.precioUnitario, {
    path: ['precioMayor'],
    message: 'El precio por mayor debe ser menor o igual al precio unitario.',
  });

export type ProductoFormInput = z.infer<typeof productoSchema>;
