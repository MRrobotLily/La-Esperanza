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

export const productoSchema = z.object({
  nombre: z.string().min(3, 'Ingresa un nombre de al menos 3 caracteres.'),
  categoria: z.enum(CATEGORIAS as [Categoria, ...Categoria[]], {
    errorMap: () => ({ message: 'Selecciona una categoría.' }),
  }),
  descripcion: z.string().min(10, 'Describe el producto con al menos 10 caracteres.'),
  precioUnitario: z.coerce.number().positive('El precio unitario debe ser mayor a 0.'),
  precioMayor: z.coerce.number().min(0).default(0),
  cantidadMayor: z.coerce.number().int().min(0).default(10),
  cantidadDisponible: z.coerce.number().int().nonnegative('La cantidad disponible no puede ser negativa.'),
  unidadMedida: z.enum(UNIDADES as [UnidadMedida, ...UnidadMedida[]]),
  imagenes: z.array(z.string()).default([]),
  tiposEntrega: z.array(z.enum(['recoger', 'delivery'])).default(['recoger']),
});

export type ProductoFormInput = z.infer<typeof productoSchema>;