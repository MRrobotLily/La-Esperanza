// ──────────────────────────────────────────────────────────────────────────────
// API de productos — CRUD con filtros, reflejando DA-02.
// ──────────────────────────────────────────────────────────────────────────────

import type { Categoria, Producto, Usuario } from '../types';
import { DB_KEYS, delay, nowIso, read, uid, write } from './storage';

function getProductos(): Producto[] {
  return read<Producto[]>(DB_KEYS.productos, []);
}

function setProductos(data: Producto[]): void {
  write(DB_KEYS.productos, data);
}

export interface FiltrosProductos {
  categoria?: Categoria | 'Todas';
  busqueda?: string;
  soloActivos?: boolean;
  productorId?: string;
}

export async function listarProductos(filtros: FiltrosProductos = {}): Promise<Producto[]> {
  let data = getProductos();
  if (filtros.productorId) {
    data = data.filter((p) => p.productorId === filtros.productorId);
  }
  if (filtros.soloActivos !== false) {
    data = data.filter((p) => p.activo);
  }
  if (filtros.categoria && filtros.categoria !== 'Todas') {
    data = data.filter((p) => p.categoria === filtros.categoria);
  }
  if (filtros.busqueda) {
    const q = filtros.busqueda.trim().toLowerCase();
    data = data.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q),
    );
  }
  data = data.slice().sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
  return delay(data);
}

export async function obtenerProducto(id: string): Promise<Producto | null> {
  const data = getProductos();
  return delay(data.find((p) => p.id === id) ?? null);
}

export async function obtenerProductorDeProducto(productoId: string): Promise<Usuario | null> {
  const producto = await obtenerProducto(productoId);
  if (!producto) return null;
  const usuarios = read<Usuario[]>(DB_KEYS.usuarios, []);
  return usuarios.find((u) => u.id === producto.productorId) ?? null;
}

export interface ProductoInput {
  nombre: string;
  categoria: Categoria;
  descripcion: string;
  precioUnitario: number;
  precioMayor: number;
  cantidadMayor: number;
  cantidadDisponible: number;
  unidadMedida: Producto['unidadMedida'];
  imagenes: string[];
  tiposEntrega: Producto['tiposEntrega'];
}

export async function crearProducto(productorId: string, datos: ProductoInput): Promise<Producto> {
  if (datos.imagenes.length < 1 || datos.imagenes.length > 5) {
    throw new Error('Debes incluir entre 1 y 5 imágenes del producto.');
  }
  const data = getProductos();
  const nuevo: Producto = {
    id: uid('p_'),
    productorId,
    activo: true,
    creadoEn: nowIso(),
    actualizadoEn: nowIso(),
    ...datos,
  };
  setProductos([nuevo, ...data]);
  return delay(nuevo);
}

export async function actualizarProducto(id: string, cambios: Partial<ProductoInput>): Promise<Producto> {
  const data = getProductos();
  const idx = data.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Producto no encontrado.');
  if (cambios.imagenes && (cambios.imagenes.length < 1 || cambios.imagenes.length > 5)) {
    throw new Error('Debes incluir entre 1 y 5 imágenes.');
  }
  data[idx] = { ...data[idx], ...cambios, actualizadoEn: nowIso() };
  setProductos(data);
  return delay(data[idx]);
}

export async function cambiarEstadoProducto(id: string, activo: boolean): Promise<Producto> {
  const data = getProductos();
  const idx = data.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Producto no encontrado.');
  data[idx].activo = activo;
  data[idx].actualizadoEn = nowIso();
  setProductos(data);
  return delay(data[idx]);
}

export async function eliminarProducto(id: string): Promise<void> {
  const data = getProductos().filter((p) => p.id !== id);
  setProductos(data);
  return delay(undefined);
}

export async function descontarStock(productoId: string, cantidad: number): Promise<void> {
  const data = getProductos();
  const idx = data.findIndex((p) => p.id === productoId);
  if (idx === -1) return;
  data[idx].cantidadDisponible = Math.max(0, data[idx].cantidadDisponible - cantidad);
  data[idx].actualizadoEn = nowIso();
  setProductos(data);
}
