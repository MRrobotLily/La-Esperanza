import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import {
  aceptarAcuerdo,
  cancelarAcuerdo,
  confirmarEntrega,
  obtenerAcuerdo,
  rechazarAcuerdo,
} from '../../../api/acuerdosApi';
import { listarUsuariosParaComite } from '../../../api/comiteApi';
import { calificar, yaCalificoAcuerdo } from '../../../api/calificacionesApi';
import type { DireccionCalificacion, TipoEntrega, Usuario } from '../../../types';

export function useAcuerdoDetalle() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [modal, setModal] = useState<
    null | 'aceptar' | 'rechazar' | 'cancelar' | 'confirmar' | 'calificar'
  >(null);

  const acuerdo = useQuery({
    queryKey: ['acuerdo', id],
    queryFn: () => (id ? obtenerAcuerdo(id) : Promise.resolve(null)),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const usuarios = useQuery({
    queryKey: ['usuarios:todos'],
    queryFn: listarUsuariosParaComite,
  });

  // Dirección de la calificación que este usuario puede emitir.
  // Comprador → productor, Productor → comprador. Comité no califica.
  const direccion: DireccionCalificacion | null =
    usuario?.rol === 'comprador'
      ? 'comprador_a_productor'
      : usuario?.rol === 'productor'
      ? 'productor_a_comprador'
      : null;

  const yaCalifico = useQuery({
    queryKey: ['calificado', id, usuario?.id, direccion],
    queryFn: () =>
      id && usuario && direccion
        ? yaCalificoAcuerdo(id, usuario.id, direccion)
        : Promise.resolve(false),
    enabled: !!id && !!usuario && !!direccion,
  });

  const aceptar = useMutation({
    mutationFn: async (entrega: {
      tipo: TipoEntrega;
      punto: string;
      fecha: string;
    }) => {
      if (!id) throw new Error('ID inválido.');
      return aceptarAcuerdo(id, entrega);
    },
    onSuccess: () => {
      toast.success('Solicitud aceptada. El comprador será notificado.');
      qc.invalidateQueries({ queryKey: ['acuerdo', id] });
      qc.invalidateQueries({ queryKey: ['acuerdos'] });
      setModal(null);
    },
  });

  const rechazar = useMutation({
    mutationFn: async (motivo: string) => {
      if (!id) throw new Error('ID inválido.');
      return rechazarAcuerdo(id, motivo);
    },
    onSuccess: () => {
      toast.success('Solicitud rechazada.');
      qc.invalidateQueries({ queryKey: ['acuerdo', id] });
      qc.invalidateQueries({ queryKey: ['acuerdos'] });
      setModal(null);
    },
  });

  const cancelar = useMutation({
    mutationFn: async (motivo: string) => {
      if (!id) throw new Error('ID inválido.');
      return cancelarAcuerdo(id, motivo);
    },
    onSuccess: () => {
      toast.success('Acuerdo cancelado.');
      qc.invalidateQueries({ queryKey: ['acuerdo', id] });
      qc.invalidateQueries({ queryKey: ['acuerdos'] });
      setModal(null);
    },
  });

  const confirmar = useMutation({
    mutationFn: async () => {
      if (!id || !usuario) throw new Error('Datos incompletos.');
      const quien = usuario.rol === 'productor' ? 'productor' : 'comprador';
      return confirmarEntrega(id, quien);
    },
    onSuccess: (ac) => {
      if (ac.estado === 'finalizado') {
        toast.success('¡Entrega finalizada por ambas partes!');
      } else {
        toast.success('Confirmación registrada. Falta la otra parte.');
      }
      qc.invalidateQueries({ queryKey: ['acuerdo', id] });
      qc.invalidateQueries({ queryKey: ['acuerdos'] });
      setModal(null);
    },
  });

  // Calificación bidireccional (comprador ↔ productor).
  const calificarMut = useMutation({
    mutationFn: async (input: { estrellas: number; resena?: string }) => {
      if (!id || !usuario || !acuerdo.data || !direccion)
        throw new Error('Datos incompletos.');

      const { compradorId, productorId } = acuerdo.data;
      const destinatarioId = direccion === 'comprador_a_productor'
        ? productorId
        : compradorId;

      // Emitimos UNA sola calificación por acuerdo; si el autor califica a un
      // productor, dejamos referenciado el primer producto del listado.
      return calificar({
        acuerdoId: id,
        compradorId,
        productorId,
        productoId:
          direccion === 'comprador_a_productor'
            ? acuerdo.data.items[0]?.productoId
            : undefined,
        autorId: usuario.id,
        destinatarioId,
        direccion,
        estrellas: input.estrellas,
        resena: input.resena,
      });
    },
    onSuccess: () => {
      toast.success('¡Gracias por tu calificación!');
      qc.invalidateQueries({ queryKey: ['calificado', id] });
      qc.invalidateQueries({ queryKey: ['reputacion'] });
      setModal(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mapaUsuarios = (usuarios.data ?? []).reduce(
    (acc, u) => acc.set(u.id, u),
    new Map<string, Usuario>(),
  );

  return {
    state: {
      acuerdo: acuerdo.data,
      cargando: acuerdo.isLoading,
      usuario,
      modal,
      mapaUsuarios,
      direccion,
      yaCalifico: !!yaCalifico.data,
      guardando:
        aceptar.isPending ||
        rechazar.isPending ||
        cancelar.isPending ||
        confirmar.isPending ||
        calificarMut.isPending,
    },
    handler: {
      setModal,
      aceptar: aceptar.mutate,
      rechazar: rechazar.mutate,
      cancelar: cancelar.mutate,
      confirmar: confirmar.mutate,
      calificar: calificarMut.mutate,
      volver: () => navigate('/acuerdos'),
    },
  };
}
