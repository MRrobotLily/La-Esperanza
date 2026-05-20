// ──────────────────────────────────────────────────────────────────────────────
// API de acuerdos de compra — orquesta el flujo DA-03.
// ──────────────────────────────────────────────────────────────────────────────

import type { Acuerdo, EstadoAcuerdo, ItemCarrito, TipoEntrega, Usuario } from '../types';
import { DB_KEYS, delay, nowIso, read, uid, write } from './storage';
import { crearNotificacion } from './notificacionesApi';
import { descontarStock, obtenerProducto } from './productosApi';

function getAcuerdos(): Acuerdo[] {
  return read<Acuerdo[]>(DB_KEYS.acuerdos, []);
}

function setAcuerdos(data: Acuerdo[]): void {
  write(DB_KEYS.acuerdos, data);
}

export async function listarAcuerdos(usuarioId: string, rol: Usuario['rol']): Promise<Acuerdo[]> {
  const data = getAcuerdos();
  const filtrados =
    rol === 'comite'
      ? data
      : rol === 'productor'
      ? data.filter((a) => a.productorId === usuarioId)
      : data.filter((a) => a.compradorId === usuarioId);
  return delay(filtrados.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)));
}

export async function obtenerAcuerdo(id: string): Promise<Acuerdo | null> {
  const data = getAcuerdos();
  return delay(data.find((a) => a.id === id) ?? null);
}

export interface CrearAcuerdoInput {
  compradorId: string;
  productorId: string;
  items: ItemCarrito[];
  canalContacto: 'chat' | 'whatsapp';
}

export async function crearAcuerdo(input: CrearAcuerdoInput): Promise<Acuerdo> {
  const itemsDetallados = await Promise.all(
    input.items.map(async (i) => {
      const p = await obtenerProducto(i.productoId);
      if (!p) throw new Error('Producto no encontrado.');
      const precio = i.cantidad >= p.cantidadMayor ? p.precioMayor : p.precioUnitario;
      return {
        productoId: p.id,
        nombreProducto: p.nombre,
        cantidad: i.cantidad,
        precioUnitario: precio,
        subtotal: precio * i.cantidad,
      };
    }),
  );
  const total = itemsDetallados.reduce((s, i) => s + i.subtotal, 0);
  const nuevo: Acuerdo = {
    id: uid('ac_'),
    compradorId: input.compradorId,
    productorId: input.productorId,
    items: itemsDetallados,
    total,
    estado: 'pendiente',
    confirmadoComprador: false,
    confirmadoProductor: false,
    canalContacto: input.canalContacto,
    creadoEn: nowIso(),
    actualizadoEn: nowIso(),
  };
  setAcuerdos([nuevo, ...getAcuerdos()]);
  await crearNotificacion({
    usuarioId: input.productorId,
    tipo: 'solicitud_compra',
    titulo: 'Nueva solicitud de compra',
    mensaje: `Tienes una nueva solicitud por Q${total.toFixed(2)}.`,
    rutaDestino: `/acuerdos/${nuevo.id}`,
  });
  return delay(nuevo);
}

async function cambiarEstado(id: string, estado: EstadoAcuerdo, extra: Partial<Acuerdo> = {}): Promise<Acuerdo> {
  const data = getAcuerdos();
  const idx = data.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Acuerdo no encontrado.');
  data[idx] = { ...data[idx], ...extra, estado, actualizadoEn: nowIso() };
  setAcuerdos(data);
  return data[idx];
}

export async function aceptarAcuerdo(
  id: string,
  entrega: { tipo: TipoEntrega; punto: string; fecha: string },
): Promise<Acuerdo> {
  const actualizado = await cambiarEstado(id, 'aceptado', { entrega });
  await crearNotificacion({
    usuarioId: actualizado.compradorId,
    tipo: 'acuerdo_aceptado',
    titulo: 'Solicitud aceptada',
    mensaje: `El productor aceptó tu solicitud. Entrega: ${entrega.punto}.`,
    rutaDestino: `/acuerdos/${actualizado.id}`,
  });
  return delay(actualizado);
}

export async function rechazarAcuerdo(id: string, motivo: string): Promise<Acuerdo> {
  const actualizado = await cambiarEstado(id, 'rechazado', { motivoRechazo: motivo });
  await crearNotificacion({
    usuarioId: actualizado.compradorId,
    tipo: 'acuerdo_rechazado',
    titulo: 'Solicitud rechazada',
    mensaje: motivo || 'El productor rechazó tu solicitud.',
    rutaDestino: `/acuerdos/${actualizado.id}`,
  });
  return delay(actualizado);
}

export async function confirmarEntrega(
  id: string,
  quien: 'comprador' | 'productor',
): Promise<Acuerdo> {
  const data = getAcuerdos();
  const idx = data.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Acuerdo no encontrado.');
  const ac = data[idx];
  if (quien === 'comprador') ac.confirmadoComprador = true;
  else ac.confirmadoProductor = true;
  ac.actualizadoEn = nowIso();

  let siguiente: EstadoAcuerdo = ac.estado;
  if (ac.confirmadoComprador && ac.confirmadoProductor) {
    siguiente = 'finalizado';
    // Descontar stock al finalizar
    await Promise.all(ac.items.map((i) => descontarStock(i.productoId, i.cantidad)));
    await crearNotificacion({
      usuarioId: ac.compradorId,
      tipo: 'acuerdo_finalizado',
      titulo: 'Compra finalizada',
      mensaje: '¡Tu compra fue finalizada! Califica tu experiencia.',
      rutaDestino: `/acuerdos/${ac.id}`,
    });
    await crearNotificacion({
      usuarioId: ac.productorId,
      tipo: 'acuerdo_finalizado',
      titulo: 'Venta finalizada',
      mensaje: 'La entrega fue confirmada por ambas partes.',
      rutaDestino: `/acuerdos/${ac.id}`,
    });
  } else {
    siguiente = 'entregado';
  }
  ac.estado = siguiente;
  setAcuerdos(data);
  return delay(ac);
}

export async function cancelarAcuerdo(id: string, motivo: string): Promise<Acuerdo> {
  return cambiarEstado(id, 'cancelado', { motivoRechazo: motivo });
}
