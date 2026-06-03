// ──────────────────────────────────────────────────────────────────────────────
// API de notificaciones — registro local (luego se reemplaza por Socket.io).
// ──────────────────────────────────────────────────────────────────────────────

import type { Notificacion } from '../types';
import { DB_KEYS, delay, nowIso, read, uid, write } from './storage';

function getNotificaciones(): Notificacion[] {
  return read<Notificacion[]>(DB_KEYS.notificaciones, []);
}

function setNotificaciones(data: Notificacion[]): void {
  write(DB_KEYS.notificaciones, data);
}

export async function crearNotificacion(
  input: Omit<Notificacion, 'id' | 'leida' | 'creadoEn'>,
): Promise<Notificacion> {
  const nueva: Notificacion = {
    ...input,
    id: uid('n_'),
    leida: false,
    creadoEn: nowIso(),
  };
  setNotificaciones([nueva, ...getNotificaciones()]);
  return delay(nueva, 40);
}

export async function listarNotificaciones(usuarioId: string): Promise<Notificacion[]> {
  const data = getNotificaciones()
    .filter((n) => n.usuarioId === usuarioId)
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  return delay(data);
}

export async function marcarComoLeida(id: string): Promise<void> {
  const data = getNotificaciones();
  const idx = data.findIndex((n) => n.id === id);
  if (idx === -1) return;
  data[idx].leida = true;
  setNotificaciones(data);
}

export async function marcarTodasLeidas(usuarioId: string): Promise<void> {
  const data = getNotificaciones();
  data.forEach((n) => {
    if (n.usuarioId === usuarioId) n.leida = true;
  });
  setNotificaciones(data);
}
