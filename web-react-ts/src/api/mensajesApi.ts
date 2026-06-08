import type { Mensaje } from '../types';

const BACKEND_URL = 'https://la-esperanza-production.up.railway.app/api';

function nowIso(): string {
  return new Date().toISOString();
}

function uid(prefix = ''): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

export function conversacionId(a: string, b: string): string {
  return [a, b].sort().join(':');
}

// LISTAR MENSAJES entre dos usuarios
export async function listarMensajes(a: string, b: string): Promise<Mensaje[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/mensajes`);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success || !data.data) return [];

    // Filtrar mensajes entre estos dos usuarios
    const mensajes = data.data
      .filter((m: any) => 
        (m.remitente_id.toString() === a && m.destinatario_id.toString() === b) ||
        (m.remitente_id.toString() === b && m.destinatario_id.toString() === a)
      )
      .map((m: any) => ({
        id: m.id.toString(),
        conversacionId: conversacionId(m.remitente_id.toString(), m.destinatario_id.toString()),
        remitenteId: m.remitente_id.toString(),
        destinatarioId: m.destinatario_id.toString(),
        acuerdoId: m.acuerdo_id ? m.acuerdo_id.toString() : undefined,
        texto: m.texto,
        leido: m.leido === 1 || m.leido === true,
        creadoEn: m.created_at || nowIso(),
      }))
      .sort((x: Mensaje, y: Mensaje) => x.creadoEn.localeCompare(y.creadoEn));

    return mensajes;
  } catch (error) {
    console.error('Error listando mensajes:', error);
    return [];
  }
}

// ENVIAR MENSAJE
export async function enviarMensaje(input: {
  remitenteId: string;
  destinatarioId: string;
  texto: string;
  acuerdoId?: string;
}): Promise<Mensaje> {
  try {
    const response = await fetch(`${BACKEND_URL}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        remitente_id: parseInt(input.remitenteId),
        destinatario_id: parseInt(input.destinatarioId),
        acuerdo_id: input.acuerdoId ? parseInt(input.acuerdoId) : null,
        texto: input.texto,
      })
    });

    if (!response.ok) {
      throw new Error('Error al enviar mensaje');
    }

    const data = await response.json();

    return {
      id: data.id ? data.id.toString() : uid('m_'),
      conversacionId: conversacionId(input.remitenteId, input.destinatarioId),
      remitenteId: input.remitenteId,
      destinatarioId: input.destinatarioId,
      acuerdoId: input.acuerdoId,
      texto: input.texto,
      leido: false,
      creadoEn: nowIso(),
    };
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    throw error;
  }
}

// MARCAR CONVERSACIÓN LEÍDA
export async function marcarConversacionLeida(a: string, b: string, receptorId: string): Promise<void> {
  // No implementado en backend, no es crítico
  return;
}

// LISTAR CONVERSACIONES de un usuario
export async function listarConversaciones(usuarioId: string): Promise<{
  otroUsuarioId: string;
  ultimo: Mensaje;
  noLeidos: number;
}[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/mensajes`);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success || !data.data) return [];

    const mensajesUsuario = data.data.filter((m: any) =>
      m.remitente_id.toString() === usuarioId || 
      m.destinatario_id.toString() === usuarioId
    );

    const map = new Map<string, { ultimo: Mensaje; otroUsuarioId: string; noLeidos: number }>();

    mensajesUsuario.forEach((m: any) => {
      const otro = m.remitente_id.toString() === usuarioId 
        ? m.destinatario_id.toString() 
        : m.remitente_id.toString();
      
      const mensaje: Mensaje = {
        id: m.id.toString(),
        conversacionId: conversacionId(m.remitente_id.toString(), m.destinatario_id.toString()),
        remitenteId: m.remitente_id.toString(),
        destinatarioId: m.destinatario_id.toString(),
        acuerdoId: m.acuerdo_id ? m.acuerdo_id.toString() : undefined,
        texto: m.texto,
        leido: m.leido === 1 || m.leido === true,
        creadoEn: m.created_at || nowIso(),
      };

      const prev = map.get(otro);
      const noLeido = !mensaje.leido && mensaje.destinatarioId === usuarioId ? 1 : 0;
      
      if (!prev || prev.ultimo.creadoEn < mensaje.creadoEn) {
        map.set(otro, { 
          ultimo: mensaje, 
          otroUsuarioId: otro, 
          noLeidos: (prev?.noLeidos ?? 0) + noLeido 
        });
      } else {
        prev.noLeidos += noLeido;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.ultimo.creadoEn.localeCompare(a.ultimo.creadoEn));
  } catch (error) {
    console.error('Error listando conversaciones:', error);
    return [];
  }
}