import type { Categoria, Producto, Usuario } from '../types';
import { nowIso, uid } from './storage';

const BACKEND_URL = 'http://localhost:3001/api';

export interface FiltrosProductos {
  categoria?: Categoria | 'Todas';
  busqueda?: string;
  soloActivos?: boolean;
  productorId?: string;
}

// LISTAR PRODUCTOS
export async function listarProductos(filtros: FiltrosProductos = {}): Promise<Producto[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/productos`);
    if (!response.ok) return [];

    const data = await response.json();
    let productos = data.success ? data.data : [];

    // Filtrar localmente
    if (filtros.productorId) {
      productos = productos.filter((p: any) => p.user_id === parseInt(filtros.productorId));
    }
    if (filtros.categoria && filtros.categoria !== 'Todas') {
      productos = productos.filter((p: any) => p.categoria === filtros.categoria);
    }
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      productos = productos.filter((p: any) => 
        p.nombre.toLowerCase().includes(q) || 
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
      );
    }

    return productos.map((p: any) => ({
      id: p.id.toString(),
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion || '',
      precioUnitario: p.precio || 0,
      precioMayor: p.precio || 0,
      cantidadMayor: 10,
      cantidadDisponible: p.stock || 0,
      unidadMedida: 'kg' as const,
      imagenes: [],
      tiposEntrega: ['recogida'] as const,
      productorId: p.user_id.toString(),
      activo: true,
      creadoEn: p.created_at || nowIso(),
      actualizadoEn: p.created_at || nowIso(),
    }));
  } catch (error) {
    console.error('Error listing productos:', error);
    return [];
  }
}

// OBTENER PRODUCTO
export async function obtenerProducto(id: string): Promise<Producto | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/productos/${id}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.data) return null;

    const p = data.data;
    return {
      id: p.id.toString(),
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion || '',
      precioUnitario: p.precio || 0,
      precioMayor: p.precio || 0,
      cantidadMayor: 10,
      cantidadDisponible: p.stock || 0,
      unidadMedida: 'kg' as const,
      imagenes: [],
      tiposEntrega: ['recogida'] as const,
      productorId: p.user_id.toString(),
      activo: true,
      creadoEn: p.created_at || nowIso(),
      actualizadoEn: p.created_at || nowIso(),
    };
  } catch (error) {
    console.error('Error fetching producto:', error);
    return null;
  }
}

// OBTENER PRODUCTOR
export async function obtenerProductorDeProducto(productoId: string): Promise<Usuario | null> {
  try {
    const producto = await obtenerProducto(productoId);
    if (!producto) return null;

    const response = await fetch(`${BACKEND_URL}/users/${producto.productorId}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.data) return null;

    const u = data.data;
    return {
      id: u.id.toString(),
      telefono: u.telefono,
      nombre: u.nombre,
      apellido: u.apellido,
      rol: u.rol,
      dpi: '',
      estado: 'activo',
      creadoEn: u.created_at || nowIso(),
    };
  } catch (error) {
    console.error('Error fetching productor:', error);
    return null;
  }
}

// CREAR PRODUCTO
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
  try {
    const response = await fetch(`${BACKEND_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: datos.nombre,
        categoria: datos.categoria,
        precio: datos.precioUnitario,
        stock: datos.cantidadDisponible,
        descripcion: datos.descripcion,
        user_id: parseInt(productorId)
      })
    });

    if (!response.ok) throw new Error('Error creating producto');

    const data = await response.json();
    if (!data.success) throw new Error('Backend error');

    return {
      id: data.id.toString(),
      nombre: datos.nombre,
      categoria: datos.categoria,
      descripcion: datos.descripcion,
      precioUnitario: datos.precioUnitario,
      precioMayor: datos.precioMayor,
      cantidadMayor: datos.cantidadMayor,
      cantidadDisponible: datos.cantidadDisponible,
      unidadMedida: datos.unidadMedida,
      imagenes: datos.imagenes,
      tiposEntrega: datos.tiposEntrega,
      productorId,
      activo: true,
      creadoEn: nowIso(),
      actualizadoEn: nowIso(),
    };
  } catch (error) {
    console.error('Error creating producto:', error);
    throw error;
  }
}

// ACTUALIZAR PRODUCTO
export async function actualizarProducto(
  productoId: string,
  datos: Partial<ProductoInput>
): Promise<Producto | null> {
  try {
    // Por ahora solo en cliente
    const producto = await obtenerProducto(productoId);
    if (!producto) return null;
    return { ...producto, ...datos, actualizadoEn: nowIso() };
  } catch (error) {
    console.error('Error updating producto:', error);
    return null;
  }
}

// ELIMINAR PRODUCTO
export async function eliminarProducto(productoId: string): Promise<boolean> {
  try {
    // Implementar en backend v2.0
    return false;
  } catch (error) {
    console.error('Error deleting producto:', error);
    return false;
  }
}

// CAMBIAR ESTADO
export async function cambiarEstadoProducto(productoId: string, activo: boolean): Promise<boolean> {
  try {
    // Implementar en backend v2.0
    return false;
  } catch (error) {
    console.error('Error changing estado:', error);
    return false;
  }
}

// DESCONTAR STOCK
export async function descontarStock(productoId: string, cantidad: number): Promise<boolean> {
  try {
    // Implementar en backend v2.0
    return true;
  } catch (error) {
    console.error('Error descontar stock:', error);
    return false;
  }
}