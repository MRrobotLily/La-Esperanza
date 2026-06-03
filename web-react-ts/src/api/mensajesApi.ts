// ──────────────────────────────────────────────────────────────────────────────
// API de mensajería — chat simple entre comprador y productor.
// En producción esto usará Socket.io; en el prototipo guardamos en localStorage.
// ──────────────────────────────────────────────────────────────────────────────

import type { Mensaje } from '../types';
import { DB_KEYS, delay, nowIso, read, uid, write } from './storage';
import { crearNotificacion } from './notificacionesApi';

function getMensajes(): Mensaje[] {
  return read<Mensaje[]>(DB_KEYS.mensajes, []);
}

function setMensajes(data: Mensaje[]): void {
  write(DB_KEYS.mensajes, data);
}

export function conversacionId(a: string, b: string): string {
  return [a, b].sort().join(':');
}

export async function listarMensajes(a: string, b: string): Promise<Mensaje[]> {
  const id = conversacionId(a, b);
  const data = getMensajes().filter((m) => m.conversacionId === id);
  return delay(data.sort((x, y) => x.creadoEn.localeCompare(y.creadoEn)));
}

export async function enviarMensaje(input: {
  remitenteId: string;
  destinatarioId: string;
  texto: string;
  acuerdoId?: string;
}): Promise<Mensaje> {
  const nuevo: Mensaje = {
    id: uid('m_'),
    conversacionId: conversacionId(input.remitenteId, input.destinatarioId),
    remitenteId: input.remitenteId,
    destinatarioId: input.destinatarioId,
    acuerdoId: input.acuerdoId,
    texto: input.texto,
    leido: false,
    creadoEn: nowIso(),
  };
  setMensajes([...getMensajes(), nuevo]);
  await crearNotificacion({
    usuarioId: input.destinatarioId,
    tipo: 'mensaje_nuevo',
    titulo: 'Nuevo mensaje',
    mensaje: input.texto.length > 80 ? input.texto.slice(0, 80) + '…' : input.texto,
    rutaDestino: `/chat/${input.remitenteId}`,
  });
  return delay(nuevo);
}

export async function marcarConversacionLeida(a: string, b: string, receptorId: string): Promise<void> {
  const data = getMensajes();
  const id = conversacionId(a, b);
  data.forEach((m) => {
    if (m.conversacionId === id && m.destinatarioId === receptorId) m.leido = true;
  });
  setMensajes(data);
}

export async function listarConversaciones(usuarioId: string): Promise<{
  otroUsuarioId: string;
  ultimo: Mensaje;
  noLeidos: number;
}[]> {
  const data = getMensajes().filter(
    (m) => m.remitenteId === usuarioId || m.destinatarioId === usuarioId,
  );
  const map = new Map<string, { ultimo: Mensaje; otroUsuarioId: string; noLeidos: number }>();
  data.forEach((m) => {
    const otro = m.remitenteId === usuarioId ? m.destinatarioId : m.remitenteId;
    const prev = map.get(otro);
    const noLeido = !m.leido && m.destinatarioId === usuarioId ? 1 : 0;
    if (!prev || prev.ultimo.creadoEn < m.creadoEn) {
      map.set(otro, { ultimo: m, otroUsuarioId: otro, noLeidos: (prev?.noLeidos ?? 0) + noLeido });
    } else {
      prev.noLeidos += noLeido;
    }
  });
  const lista = Array.from(map.values()).sort((a, b) => b.ultimo.creadoEn.localeCompare(a.ultimo.creadoEn));
  return delay(lista);
}
