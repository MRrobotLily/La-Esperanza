import { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { listarProductos } from '../../../api/productosApi';
import { DB_KEYS, read } from '../../../api/storage';
import type { Categoria, Usuario, Calificacion } from '../../../types';
import { CATEGORIAS } from '../../../schemas/productoSchema';

export function useCatalogo() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<Categoria | 'Todas'>('Todas');

  const productos = useQuery({
    queryKey: ['productos', categoria, busqueda],
    queryFn: () => listarProductos({ categoria, busqueda, soloActivos: true }),
  });

  // Indexamos productores y calificaciones para enriquecer cada tarjeta.
  const mapaResumenes = useQuery({
    queryKey: ['productos:resumen', productos.data?.map((p) => p.id).join(',') ?? ''],
    queryFn: () => {
      const usuarios = read<Usuario[]>(DB_KEYS.usuarios, []);
      const calificaciones = read<Calificacion[]>(DB_KEYS.calificaciones, []);
      const mapProd = new Map<string, string>(
        usuarios.map((u) => [u.id, `${u.nombre} ${u.apellido}`]),
      );
      const mapProm = new Map<string, { promedio: number; total: number }>();
      const porProducto = new Map<string, number[]>();
      calificaciones.forEach((c) => {
        if (!c.productoId) return; // solo reseñas ligadas a un producto
        const lst = porProducto.get(c.productoId) ?? [];
        lst.push(c.estrellas);
        porProducto.set(c.productoId, lst);
      });
      porProducto.forEach((lista, id) => {
        mapProm.set(id, {
          promedio: lista.reduce((a, b) => a + b, 0) / lista.length,
          total: lista.length,
        });
      });
      return { mapProd, mapProm };
    },
    enabled: !!productos.data,
  });

  const categorias = useMemo<('Todas' | Categoria)[]>(
    () => ['Todas', ...CATEGORIAS],
    [],
  );

  return {
    state: {
      busqueda,
      categoria,
      categorias,
      productos: productos.data ?? [],
      cargando: productos.isLoading,
      mapa: mapaResumenes.data,
    },
    handler: {
      setBusqueda,
      setCategoria,
    },
  };
}

// evita warning de unused por useQueries si no lo ocupamos acá
export const _keepQueriesImport = useQueries;
