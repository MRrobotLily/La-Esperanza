import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  crearProducto,
  actualizarProducto,
  obtenerProducto,
} from '../../../api/productosApi';
import { productoSchema, type ProductoFormInput } from '../../../schemas/productoSchema';
import { useAuth } from '../../../providers/AuthProvider/useAuth';

const valoresIniciales: ProductoFormInput = {
  nombre: '',
  categoria: 'Hortalizas',
  descripcion: '',
  precioUnitario: 0,
  precioMayor: 0,
  cantidadMayor: 10,
  cantidadDisponible: 0,
  unidadMedida: 'lb',
  imagenes: [],
  tiposEntrega: ['recoger'],
};

export function useProductoForm() {
  const { id } = useParams<{ id?: string }>();
  const editando = !!id;
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<ProductoFormInput>({
    resolver: zodResolver(productoSchema),
    defaultValues: valoresIniciales,
  });

  const producto = useQuery({
    queryKey: ['producto', id],
    queryFn: () => obtenerProducto(id!),
    enabled: editando,
  });

  useEffect(() => {
    if (editando && producto.data) {
      form.reset({
        nombre: producto.data.nombre,
        categoria: producto.data.categoria,
        descripcion: producto.data.descripcion,
        precioUnitario: producto.data.precioUnitario,
        precioMayor: producto.data.precioMayor,
        cantidadMayor: producto.data.cantidadMayor,
        cantidadDisponible: producto.data.cantidadDisponible,
        unidadMedida: producto.data.unidadMedida,
        imagenes: producto.data.imagenes,
        tiposEntrega: producto.data.tiposEntrega,
      });
    }
  }, [editando, producto.data, form]);

  const guardar = useMutation({
    mutationFn: async (datos: ProductoFormInput) => {
      if (!usuario) throw new Error('Sesión inválida.');
      if (editando) return actualizarProducto(id!, datos);
      return crearProducto(usuario.id, datos);
    },
    onSuccess: () => {
      toast.success(editando ? 'Producto actualizado.' : 'Producto publicado.');
      qc.invalidateQueries({ queryKey: ['mis-productos', usuario?.id] });
      qc.invalidateQueries({ queryKey: ['productos'] });
      navigate('/mis-productos');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    state: {
      form,
      editando,
      cargando: editando && producto.isLoading,
      guardando: guardar.isPending,
    },
    handler: {
      submit: form.handleSubmit((d) => guardar.mutate(d)),
    },
  };
}
