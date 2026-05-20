// ──────────────────────────────────────────────────────────────────────────────
// Schemas de acuerdos — entrega y sanción.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

export const entregaSchema = z.object({
  tipo: z.enum(['recoger', 'delivery']),
  punto: z.string().min(3, 'Indica el punto de entrega.'),
  fecha: z.string().min(1, 'Indica la fecha.'),
});

export type EntregaInput = z.infer<typeof entregaSchema>;

export const sancionSchema = z
  .object({
    tipo: z.enum(['advertencia', 'observacion', 'suspension_temporal', 'cancelacion_permanente', 'reactivacion']),
    motivo: z.string().min(5, 'Describe el motivo (mín 5 caracteres).'),
    duracionDias: z.coerce.number().int().min(1).max(365).optional(),
  })
  .refine((v) => v.tipo !== 'suspension_temporal' || (v.duracionDias && v.duracionDias > 0), {
    path: ['duracionDias'],
    message: 'Indica la duración en días.',
  });

export type SancionInput = z.infer<typeof sancionSchema>;
