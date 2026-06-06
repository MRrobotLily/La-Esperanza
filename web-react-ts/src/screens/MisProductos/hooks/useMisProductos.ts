import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  cambiarEstadoProducto,
  eliminarProducto,
  listarProductos,
} from '../../../api/productosApi';
import { useAuth } from '../../../providers/AuthProvider/useAuth';

export function useMisProductos() {
  const { usuario } = useAuth();
  const qc = useQueryClient();

  const productos = useQuery({
    queryKey: ['mis-productos', usuario?.id],
    queryFn: () =>
      listarProductos({
        productorId: usuario!.id,
        soloActivos: false,
      }),
    enabled: !!usuario,
  });

  const togglear = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      cambiarEstadoProducto(id, activo),
    onSuccess: () => {
      toast.success('Estado del producto actualizado.');
      // Invalidar TODAS las queries de productos
      qc.invalidateQueries({ queryKey: ['mis-productos'] });
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['productos:resumen'] });
      qc.refetchQueries({ queryKey: ['mis-productos', usuario?.id] });
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => eliminarProducto(id),
    onSuccess: () => {
      toast.success('Producto eliminado.');
      qc.invalidateQueries({ queryKey: ['mis-productos'] });
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.refetchQueries({ queryKey: ['mis-productos', usuario?.id] });
    },
  });

  return {
    state: {
      productos: productos.data ?? [],
      cargando: productos.isLoading,
    },
    handler: {
      togglear: (id: string, activo: boolean) => togglear.mutate({ id, activo }),
      eliminar: (id: string) => eliminar.mutate(id),
    },
  };
}