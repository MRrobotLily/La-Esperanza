import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  listarProductos,
  obtenerProducto,
  obtenerProductorDeProducto,
} from '../../../api/productosApi';
import { calificacionesPorProducto } from '../../../api/calificacionesApi';
import { agregarAlCarrito } from '../../../api/carritoApi';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import type { Producto } from '../../../types';

export function useProductoDetalle() {
  const { id = '' } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [cantidad, setCantidad] = useState(1);

  const producto = useQuery({
    queryKey: ['producto', id],
    queryFn: () => obtenerProducto(id),
    enabled: !!id,
  });

  const productor = useQuery({
    queryKey: ['producto:productor', id],
    queryFn: () => obtenerProductorDeProducto(id),
    enabled: !!id,
  });

  const calificaciones = useQuery({
    queryKey: ['producto:calificaciones', id],
    queryFn: () => calificacionesPorProducto(id),
    enabled: !!id,
  });

  // Productos relacionados: primero los del MISMO productor, luego de la
  // MISMA categoría. Máximo 4, sin incluir el actual.
  const relacionados = useQuery<Producto[]>({
    queryKey: ['producto:relacionados', id, producto.data?.productorId, producto.data?.categoria],
    queryFn: async () => {
      const actual = producto.data;
      if (!actual) return [];
      const [mismoProductor, mismaCategoria] = await Promise.all([
        listarProductos({ productorId: actual.productorId, soloActivos: true }),
        listarProductos({ categoria: actual.categoria, soloActivos: true }),
      ]);
      const seen = new Set<string>([actual.id]);
      const lista: Producto[] = [];
      for (const p of mismoProductor) {
        if (!seen.has(p.id)) {
          lista.push(p);
          seen.add(p.id);
        }
        if (lista.length >= 4) break;
      }
      if (lista.length < 4) {
        for (const p of mismaCategoria) {
          if (!seen.has(p.id)) {
            lista.push(p);
            seen.add(p.id);
          }
          if (lista.length >= 4) break;
        }
      }
      return lista;
    },
    enabled: !!producto.data,
  });

  const agregar = useMutation({
    mutationFn: () => {
      if (!usuario) throw new Error('Debes iniciar sesión para comprar.');
      if (usuario.rol !== 'comprador') throw new Error('Solo los compradores pueden usar el carrito.');
      return agregarAlCarrito(usuario.id, id, cantidad);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrito', usuario?.id] });
      toast.success('Producto agregado a tu lista.');
    },
    onError: (e: Error) => {
      if (/iniciar sesión/i.test(e.message)) {
        navigate(`/login?redirect=/producto/${id}`);
      }
      toast.error(e.message);
    },
  });

  const data = producto.data;
  const cals = calificaciones.data ?? [];
  const promedio = cals.length
    ? cals.reduce((s, c) => s + c.estrellas, 0) / cals.length
    : 0;

  const superaStock = data ? cantidad > data.cantidadDisponible : false;
  const precioAplicado = data
    ? cantidad >= data.cantidadMayor
      ? data.precioMayor
      : data.precioUnitario
    : 0;

  return {
    state: {
      producto: data,
      productor: productor.data ?? null,
      calificaciones: cals,
      promedio,
      cantidad,
      superaStock,
      precioAplicado,
      subtotal: precioAplicado * cantidad,
      cargando: producto.isLoading,
      agregando: agregar.isPending,
      relacionados: relacionados.data ?? [],
    },
    handler: {
      setCantidad: (n: number) => setCantidad(Math.max(1, Math.min(n, 9999))),
      incrementar: () => setCantidad((c) => c + 1),
      decrementar: () => setCantidad((c) => Math.max(1, c - 1)),
      agregarAlCarrito: () => agregar.mutate(),
    },
  };
}
