// ──────────────────────────────────────────────────────────────────────────────
// API de calificaciones — 1 a 5 estrellas + reseña por acuerdo finalizado.
// Bidireccional: el comprador califica al productor y viceversa.
// ──────────────────────────────────────────────────────────────────────────────

import type { Calificacion, DireccionCalificacion } from '../types';
import { DB_KEYS, delay, nowIso, read, uid, write } from './storage';
import { crearNotificacion } from './notificacionesApi';

function getCalificaciones(): Calificacion[] {
  return read<Calificacion[]>(DB_KEYS.calificaciones, []);
}

function setCalificaciones(data: Calificacion[]): void {
  write(DB_KEYS.calificaciones, data);
}

/**
 * Registra una calificación. Emite notificación al destinatario.
 */
export async function calificar(
  input: Omit<Calificacion, 'id' | 'creadoEn'>,
): Promise<Calificacion> {
  const nueva: Calificacion = {
    ...input,
    id: uid('c_'),
    creadoEn: nowIso(),
  };
  setCalificaciones([...getCalificaciones(), nueva]);

  await crearNotificacion({
    usuarioId: input.destinatarioId,
    tipo: 'calificacion',
    titulo: `Nueva calificación (${input.estrellas}★)`,
    mensaje: input.resena ? input.resena : 'Recibiste una nueva calificación.',
    rutaDestino: '/perfil',
  });

  return delay(nueva);
}

/**
 * Calificaciones recibidas por un usuario (independiente de si es productor o comprador).
 */
export async function calificacionesRecibidas(usuarioId: string): Promise<Calificacion[]> {
  return delay(
    getCalificaciones()
      .filter((c) => c.destinatarioId === usuarioId)
      .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)),
  );
}

/**
 * Compat: devuelve calificaciones emitidas hacia un productor.
 */
export async function calificacionesPorProductor(productorId: string): Promise<Calificacion[]> {
  return delay(
    getCalificaciones().filter(
      (c) => c.productorId === productorId && c.direccion === 'comprador_a_productor',
    ),
  );
}

export async function calificacionesPorProducto(productoId: string): Promise<Calificacion[]> {
  return delay(getCalificaciones().filter((c) => c.productoId === productoId));
}

/**
 * ¿El usuario `autorId` ya calificó al acuerdo `acuerdoId` en la dirección indicada?
 */
export async function yaCalificoAcuerdo(
  acuerdoId: string,
  autorId: string,
  direccion: DireccionCalificacion,
): Promise<boolean> {
  const match = getCalificaciones().some(
    (c) =>
      c.acuerdoId === acuerdoId &&
      c.autorId === autorId &&
      c.direccion === direccion,
  );
  return delay(match);
}

export function promedio(estrellas: number[]): number {
  if (!estrellas.length) return 0;
  return estrellas.reduce((a, b) => a + b, 0) / estrellas.length;
}

/**
 * Resumen de reputación de un usuario (como productor y/o comprador).
 */
export interface ResumenReputacion {
  total: number;
  promedio: number;
  distribucion: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function resumen(calificaciones: Calificacion[]): ResumenReputacion {
  const estrellas = calificaciones.map((c) => c.estrellas);
  const distribucion: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  estrellas.forEach((e) => {
    const k = Math.max(1, Math.min(5, Math.round(e))) as 1 | 2 | 3 | 4 | 5;
    distribucion[k] += 1;
  });
  return {
    total: estrellas.length,
    promedio: promedio(estrellas),
    distribucion,
  };
}
