import type { ItemCarrito, Producto } from '../types';
import { obtenerProducto } from './productosApi';

const BACKEND_URL = 'https://la-esperanza-production.up.railway.app/api';

// LEER CARRITO desde backend
export async function leerCarrito(usuarioId: string): Promise<ItemCarrito[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/carrito/${usuarioId}`);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.success || !data.data) return [];

    return data.data.map((item: any) => ({
      productoId: item.producto_id.toString(),
      cantidad: item.cantidad || 1,
    }));
  } catch (error) {
    console.error('Error leyendo carrito:', error);
    return [];
  }
}

// GUARDAR CARRITO (helper)
export async function guardarCarrito(usuarioId: string, items: ItemCarrito[]): Promise<void> {
  // No usar
}

// AGREGAR AL CARRITO
export async function agregarAlCarrito(
  usuarioId: string,
  productoId: string,
  cantidad: number,
): Promise<ItemCarrito[]> {
  try {
    console.log('🛒 Agregando:', { usuarioId, productoId, cantidad });
    
    await fetch(`${BACKEND_URL}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: parseInt(usuarioId),
        producto_id: parseInt(productoId),
        cantidad
      })
    });

    return leerCarrito(usuarioId);
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    return [];
  }
}

// ACTUALIZAR CANTIDAD
export async function actualizarCantidad(
  usuarioId: string,
  productoId: string,
  cantidad: number,
): Promise<ItemCarrito[]> {
  try {
    if (cantidad <= 0) {
      return eliminarDelCarrito(usuarioId, productoId);
    }

    await fetch(`${BACKEND_URL}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: parseInt(usuarioId),
        producto_id: parseInt(productoId),
        cantidad
      })
    });

    return leerCarrito(usuarioId);
  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    return [];
  }
}

// ELIMINAR DEL CARRITO
export async function eliminarDelCarrito(
  usuarioId: string,
  productoId: string,
): Promise<ItemCarrito[]> {
  try {
    await fetch(`${BACKEND_URL}/carrito/${usuarioId}/${productoId}`, {
      method: 'DELETE'
    });
    return leerCarrito(usuarioId);
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    return [];
  }
}

// VACIAR CARRITO
export async function vaciarCarrito(usuarioId: string): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/carrito/${usuarioId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error vaciando carrito:', error);
  }
}

// CARRITO HIDRATADO
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

      const precioAplicado = i.cantidad >= producto.cantidadMayor 
        ? producto.precioMayor 
        : producto.precioUnitario;
      
      const subtotal = precioAplicado * i.cantidad;
      const superaStock = i.cantidad > producto.cantidadDisponible;

      return {
        ...i,
        producto,
        precioAplicado,
        subtotal,
        superaStock,
      };
    }),
  );

  return hidratados.filter((i): i is ItemCarritoHidratado => i !== null);
}

// AGRUPAR POR PRODUCTOR
export async function agruparPorProductor(usuarioId: string): Promise<Record<string, ItemCarritoHidratado[]>> {
  const items = await leerCarritoHidratado(usuarioId);
  const grupos: Record<string, ItemCarritoHidratado[]> = {};

  for (const item of items) {
    const productorId = item.producto.productorId;
    if (!grupos[productorId]) {
      grupos[productorId] = [];
    }
    grupos[productorId].push(item);
  }

  return grupos;
}