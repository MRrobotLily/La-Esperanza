import type { Categoria, Producto, Usuario } from '../types';

const BACKEND_URL = 'https://la-esperanza-production.up.railway.app/api';

function nowIso(): string {
  return new Date().toISOString();
}

export interface FiltrosProductos {
  categoria?: Categoria | 'Todas';
  busqueda?: string;
  soloActivos?: boolean;
  productorId?: string;
}

// LISTAR PRODUCTOS desde backend
export async function listarProductos(filtros: FiltrosProductos = {}): Promise<Producto[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/productos`);
    if (!response.ok) return [];

    const data = await response.json();
    let productos = data.success ? data.data : [];

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
    if (filtros.soloActivos !== false) {
      productos = productos.filter((p: any) => p.activo !== 0 && p.activo !== false);
    }

    return productos.map((p: any) => ({
      id: p.id.toString(),
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion || '',
      precioUnitario: parseFloat(p.precio) || 0,
      precioMayor: parseFloat(p.precio_mayor) || parseFloat(p.precio) || 0,
      cantidadMayor: parseInt(p.cantidad_mayor) || 10,
      cantidadDisponible: parseInt(p.stock) || 0,
      unidadMedida: (p.unidad_medida || 'kg') as any,
      imagenes: [],
      tiposEntrega: ['recoger'] as any,
      productorId: p.user_id ? p.user_id.toString() : '0',
      activo: p.activo !== 0 && p.activo !== false,
      creadoEn: p.created_at || nowIso(),
      actualizadoEn: p.created_at || nowIso(),
    }));
  } catch (error) {
    console.error('Error listando productos:', error);
    return [];
  }
}

// OBTENER PRODUCTO por ID
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
      precioUnitario: parseFloat(p.precio) || 0,
      precioMayor: parseFloat(p.precio_mayor) || parseFloat(p.precio) || 0,
      cantidadMayor: parseInt(p.cantidad_mayor) || 10,
      cantidadDisponible: parseInt(p.stock) || 0,
      unidadMedida: (p.unidad_medida || 'kg') as any,
      imagenes: [],
      tiposEntrega: ['recoger'] as any,
      productorId: p.user_id ? p.user_id.toString() : '0',
      activo: p.activo !== 0 && p.activo !== false,
      creadoEn: p.created_at || nowIso(),
      actualizadoEn: p.created_at || nowIso(),
    };
  } catch (error) {
    console.error('Error obteniendo producto:', error);
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
    console.error('Error obteniendo productor:', error);
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
        user_id: parseInt(productorId),
        precio_mayor: datos.precioMayor,
        cantidad_mayor: datos.cantidadMayor,
        unidad_medida: datos.unidadMedida,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear producto');
    }

    const data = await response.json();

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
    console.error('Error creando producto:', error);
    throw error;
  }
}

// ACTUALIZAR PRODUCTO
export async function actualizarProducto(
  productoId: string,
  datos: Partial<ProductoInput>
): Promise<Producto | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/productos/${productoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: datos.nombre,
        categoria: datos.categoria,
        precio: datos.precioUnitario,
        stock: datos.cantidadDisponible,
        descripcion: datos.descripcion,
        precio_mayor: datos.precioMayor,
        cantidad_mayor: datos.cantidadMayor,
        unidad_medida: datos.unidadMedida,
      })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar producto');
    }

    return obtenerProducto(productoId);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return null;
  }
}

// ELIMINAR PRODUCTO
export async function eliminarProducto(productoId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/productos/${productoId}`, {
      method: 'DELETE'
    });

    return response.ok;
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return false;
  }
}

// CAMBIAR ESTADO (pausar/activar)
export async function cambiarEstadoProducto(productoId: string, activo: boolean): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/productos/${productoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo })
    });

    return response.ok;
  } catch (error) {
    console.error('Error cambiando estado:', error);
    return false;
  }
}

// DESCONTAR STOCK
export async function descontarStock(productoId: string, cantidad: number): Promise<boolean> {
  return true;
}