import type { Calificacion, DireccionCalificacion } from '../types';

const BACKEND_URL = 'https://la-esperanza-production.up.railway.app/api';

function nowIso(): string {
  return new Date().toISOString();
}

export async function calificar(
  input: Omit<Calificacion, 'id' | 'creadoEn'>,
): Promise<Calificacion> {
  try {
    const response = await fetch(`${BACKEND_URL}/calificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acuerdo_id: parseInt(input.acuerdoId),
        emisor_id: parseInt(input.autorId),
        receptor_id: parseInt(input.destinatarioId),
        estrellas: input.estrellas,
        comentario: input.resena || '',
        direccion: input.direccion,
      })
    });

    if (!response.ok) throw new Error('Error al calificar');

    const data = await response.json();
    return {
      ...input,
      id: data.id.toString(),
      creadoEn: nowIso(),
    } as Calificacion;
  } catch (error) {
    console.error('Error calificando:', error);
    throw error;
  }
}

export async function calificacionesRecibidas(usuarioId: string): Promise<Calificacion[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/calificaciones`);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success || !data.data) return [];

    return data.data
      .filter((c: any) => c.receptor_id.toString() === usuarioId)
      .map((c: any) => ({
        id: c.id.toString(),
        acuerdoId: c.acuerdo_id.toString(),
        autorId: c.emisor_id.toString(),
        destinatarioId: c.receptor_id.toString(),
        productorId: c.receptor_id.toString(),
        compradorId: c.emisor_id.toString(),
        productoId: '',
        estrellas: c.estrellas,
        resena: c.comentario || '',
        direccion: c.direccion,
        creadoEn: c.created_at || nowIso(),
      }));
  } catch (error) {
    console.error('Error calificaciones:', error);
    return [];
  }
}

export async function calificacionesPorProductor(productorId: string): Promise<Calificacion[]> {
  return calificacionesRecibidas(productorId);
}

export async function calificacionesPorProducto(productoId: string): Promise<Calificacion[]> {
  return [];
}

export async function yaCalificoAcuerdo(
  acuerdoId: string,
  autorId: string,
  direccion: DireccionCalificacion,
): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/calificaciones`);
    if (!response.ok) return false;

    const data = await response.json();
    if (!data.success || !data.data) return false;

    return data.data.some((c: any) =>
      c.acuerdo_id.toString() === acuerdoId &&
      c.emisor_id.toString() === autorId &&
      c.direccion === direccion
    );
  } catch {
    return false;
  }
}

export function promedio(estrellas: number[]): number {
  if (!estrellas.length) return 0;
  return estrellas.reduce((a, b) => a + b, 0) / estrellas.length;
}

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