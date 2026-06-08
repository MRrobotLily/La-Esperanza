import type { Acuerdo, EstadoAcuerdo, ItemCarrito, TipoEntrega, Usuario } from '../types';
import { obtenerProducto } from './productosApi';

const BACKEND_URL = 'https://la-esperanza-production.up.railway.app/api';

function nowIso(): string {
  return new Date().toISOString();
}

export async function listarAcuerdos(usuarioId: string, rol: Usuario['rol']): Promise<Acuerdo[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/acuerdos`);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success || !data.data) return [];

    let acuerdos = data.data.map((a: any) => ({
      id: a.id.toString(),
      compradorId: a.comprador_id.toString(),
      productorId: a.productor_id.toString(),
      items: typeof a.items === 'string' ? JSON.parse(a.items) : (a.items || []),
      total: 0,
      estado: a.estado || 'pendiente',
      confirmadoComprador: false,
      confirmadoProductor: false,
      canalContacto: a.canal_contacto || 'chat',
      creadoEn: a.created_at || nowIso(),
      actualizadoEn: a.created_at || nowIso(),
    }));

    if (rol === 'productor') {
      acuerdos = acuerdos.filter((a: any) => a.productorId === usuarioId);
    } else if (rol === 'comprador') {
      acuerdos = acuerdos.filter((a: any) => a.compradorId === usuarioId);
    }

    return acuerdos.sort((a: any, b: any) => b.creadoEn.localeCompare(a.creadoEn));
  } catch (error) {
    console.error('Error listando acuerdos:', error);
    return [];
  }
}

export async function obtenerAcuerdo(id: string): Promise<Acuerdo | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/acuerdos`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.data) return null;

    const a = data.data.find((x: any) => x.id.toString() === id);
    if (!a) return null;

    return {
      id: a.id.toString(),
      compradorId: a.comprador_id.toString(),
      productorId: a.productor_id.toString(),
      items: typeof a.items === 'string' ? JSON.parse(a.items) : (a.items || []),
      total: 0,
      estado: a.estado || 'pendiente',
      confirmadoComprador: false,
      confirmadoProductor: false,
      canalContacto: a.canal_contacto || 'chat',
      creadoEn: a.created_at || nowIso(),
      actualizadoEn: a.created_at || nowIso(),
    };
  } catch (error) {
    return null;
  }
}

export interface CrearAcuerdoInput {
  compradorId: string;
  productorId: string;
  items: ItemCarrito[];
  canalContacto: 'chat' | 'whatsapp';
}

export async function crearAcuerdo(input: CrearAcuerdoInput): Promise<Acuerdo> {
  try {
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

    const response = await fetch(`${BACKEND_URL}/acuerdos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comprador_id: parseInt(input.compradorId),
        productor_id: parseInt(input.productorId),
        items: itemsDetallados,
        canal_contacto: input.canalContacto,
      })
    });

    if (!response.ok) throw new Error('Error al crear acuerdo');

    const data = await response.json();

    return {
      id: data.id.toString(),
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
  } catch (error) {
    console.error('Error creando acuerdo:', error);
    throw error;
  }
}

async function actualizarEstado(id: string, estado: string): Promise<void> {
  await fetch(`${BACKEND_URL}/acuerdos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });
}

export async function aceptarAcuerdo(
  id: string,
  entrega: { tipo: TipoEntrega; punto: string; fecha: string },
): Promise<Acuerdo> {
  await actualizarEstado(id, 'aceptado');
  return { id, estado: 'aceptado', entrega } as any;
}

export async function rechazarAcuerdo(id: string, motivo: string): Promise<Acuerdo> {
  await actualizarEstado(id, 'rechazado');
  return { id, estado: 'rechazado', motivoRechazo: motivo } as any;
}

export async function confirmarEntrega(
  id: string,
  quien: 'comprador' | 'productor',
): Promise<Acuerdo> {
  await actualizarEstado(id, 'finalizado');
  return { id, estado: 'finalizado' } as any;
}

export async function cancelarAcuerdo(id: string, motivo: string): Promise<Acuerdo> {
  await actualizarEstado(id, 'cancelado');
  return { id, estado: 'cancelado' } as any;
}