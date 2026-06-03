import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  advertirUsuario,
  cancelarUsuario,
  listarUsuariosParaComite,
  reactivarUsuario,
  suspenderUsuario,
} from '../../../api/comiteApi';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import type { Usuario } from '../../../types';

export type SancionTipo =
  | 'advertencia'
  | 'suspension_temporal'
  | 'cancelacion_permanente'
  | 'reactivacion';

export function useComiteUsuarios() {
  const { usuario } = useAuth();
  const qc = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<'todos' | Usuario['rol']>('todos');
  const [filtroEstado, setFiltroEstado] = useState<
    'todos' | Usuario['estado']
  >('todos');
  const [seleccionado, setSeleccionado] = useState<Usuario | null>(null);
  const [sancion, setSancion] = useState<SancionTipo | null>(null);

  const usuarios = useQuery({
    queryKey: ['comite:usuarios'],
    queryFn: listarUsuariosParaComite,
  });

  const lista = useMemo(() => {
    const bq = busqueda.trim().toLowerCase();
    return (usuarios.data ?? [])
      .filter((u) => {
        if (filtroRol !== 'todos' && u.rol !== filtroRol) return false;
        if (filtroEstado !== 'todos' && u.estado !== filtroEstado) return false;
        if (!bq) return true;
        return (
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(bq) ||
          u.telefono.includes(bq) ||
          u.dpi.includes(bq)
        );
      })
      .filter((u) => u.rol !== 'comite'); // el comité no se sanciona a sí mismo
  }, [usuarios.data, busqueda, filtroRol, filtroEstado]);

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['comite:usuarios'] });
    qc.invalidateQueries({ queryKey: ['comite:stats'] });
    qc.invalidateQueries({ queryKey: ['comite:auditoria'] });
    qc.invalidateQueries({ queryKey: ['usuarios:todos'] });
  };

  const aplicarSancion = useMutation({
    mutationFn: async (input: {
      tipo: SancionTipo;
      motivo: string;
      duracionDias?: number;
    }) => {
      if (!usuario || !seleccionado) throw new Error('Sin selección.');
      switch (input.tipo) {
        case 'advertencia':
          return advertirUsuario(usuario.id, seleccionado.id, input.motivo);
        case 'suspension_temporal':
          return suspenderUsuario(
            usuario.id,
            seleccionado.id,
            input.motivo,
            input.duracionDias ?? 7,
          );
        case 'cancelacion_permanente':
          return cancelarUsuario(usuario.id, seleccionado.id, input.motivo);
        case 'reactivacion':
          return reactivarUsuario(usuario.id, seleccionado.id, input.motivo);
      }
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.tipo === 'reactivacion'
          ? 'Cuenta reactivada.'
          : vars.tipo === 'advertencia'
          ? 'Advertencia enviada.'
          : vars.tipo === 'suspension_temporal'
          ? 'Cuenta suspendida.'
          : 'Cuenta cancelada.',
      );
      invalidar();
      setSancion(null);
      setSeleccionado(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    state: {
      lista,
      cargando: usuarios.isLoading,
      busqueda,
      filtroRol,
      filtroEstado,
      seleccionado,
      sancion,
      aplicando: aplicarSancion.isPending,
    },
    handler: {
      setBusqueda,
      setFiltroRol,
      setFiltroEstado,
      seleccionar: setSeleccionado,
      iniciarSancion: setSancion,
      aplicar: aplicarSancion.mutate,
      cerrarModal: () => setSancion(null),
      cerrarDetalle: () => setSeleccionado(null),
    },
  };
}
