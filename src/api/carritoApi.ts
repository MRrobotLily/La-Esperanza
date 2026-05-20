// ──────────────────────────────────────────────────────────────────────────────
// Carrito persistido por comprador — según DA-03 la lista es pre-selección,
// no cobro. Se agrupa por productor al momento de enviar al productor.
// ──────────────────────────────────────────────────────────────────────────────

import type { ItemCarrito, Producto } from '../types';
import { delay } from './storage';
import { obtenerProducto } from './productosApi';

const key = (usuarioId: string) => `dercas.carrito.${usuarioId}`;

export async function leerCarrito(usuarioId: string): Promise<ItemCarrito[]> {
  try {
    const raw = localStorage.getItem(key(usuarioId));
    return delay(raw ? (JSON.parse(raw) as ItemCarrito[]) : []);
  } catch {
    return delay([]);
  }
}

export async function guardarCarrito(usuarioId: string, items: ItemCarrito[]): Promise<void> {
  localStorage.setItem(key(usuarioId), JSON.stringify(items));
  return delay(undefined, 40);
}

export async function agregarAlCarrito(
  usuarioId: string,
  productoId: string,
  cantidad: number,
): Promise<ItemCarrito[]> {
  const items = await leerCarrito(usuarioId);
  const existente = items.find((i) => i.productoId === productoId);
  if (existente) existente.cantidad += cantidad;
  else items.push({ productoId, cantidad });
  await guardarCarrito(usuarioId, items);
  return items;
}

export async function actualizarCantidad(
  usuarioId: string,
  productoId: string,
  cantidad: number,
): Promise<ItemCarrito[]> {
  const items = await leerCarrito(usuarioId);
  const existente = items.find((i) => i.productoId === productoId);
  if (!existente) return items;
  if (cantidad <= 0) return eliminarDelCarrito(usuarioId, productoId);
  existente.cantidad = cantidad;
  await guardarCarrito(usuarioId, items);
  return items;
}

export async function eliminarDelCarrito(
  usuarioId: string,
  productoId: string,
): Promise<ItemCarrito[]> {
  const items = (await leerCarrito(usuarioId)).filter((i) => i.productoId !== productoId);
  await guardarCarrito(usuarioId, items);
  return items;
}

export async function vaciarCarrito(usuarioId: string): Promise<void> {
  localStorage.removeItem(key(usuarioId));
  return delay(undefined, 40);
}

export interface ItemCarritoHidratado extends ItemCarrito {
  producto: Producto;
  precioAplicado: number;
  subtotal: number;
  superaStock: boolean;
}

export async function leerCarritoHidratado(usuarioId: string): Promise<ItemCarritoHidratado[]> {
  const items = await leerCarrito(usuarioId);
  const hidratados = await Promise.all(
    items.map(async (i) => {
      const producto = await obtenerProducto(i.productoId);
      if (!producto) return null;
      const precioAplicado =
        i.cantidad >= producto.cantidadMayor ? producto.precioMayor : producto.precioUnitario;
      return {
        ...i,
        producto,
        precioAplicado,
        subtotal: precioAplicado * i.cantidad,
        superaStock: i.cantidad > producto.cantidadDisponible,
      } as ItemCarritoHidratado;
    }),
  );
  return hidratados.filter((x): x is ItemCarritoHidratado => x !== null);
}
