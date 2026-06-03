import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import {
  listarNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
} from '../../../api/notificacionesApi';
import type { Notificacion } from '../../../types';

export function useNotificaciones() {
  const { usuario } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const notifs = useQuery({
    queryKey: ['notificaciones', usuario?.id],
    queryFn: () =>
      usuario ? listarNotificaciones(usuario.id) : Promise.resolve([]),
    enabled: !!usuario,
  });

  const leerUna = useMutation({
    mutationFn: async (id: string) => marcarComoLeida(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificaciones', usuario?.id] });
    },
  });

  const leerTodas = useMutation({
    mutationFn: async () => {
      if (!usuario) return;
      return marcarTodasLeidas(usuario.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificaciones', usuario?.id] });
    },
  });

  const abrir = (n: Notificacion) => {
    if (!n.leida) leerUna.mutate(n.id);
    if (n.rutaDestino) navigate(n.rutaDestino);
  };

  return {
    state: {
      notifs: notifs.data ?? [],
      cargando: notifs.isLoading,
      noLeidas: (notifs.data ?? []).filter((n) => !n.leida).length,
    },
    handler: {
      abrir,
      leerTodas: () => leerTodas.mutate(),
    },
  };
}
