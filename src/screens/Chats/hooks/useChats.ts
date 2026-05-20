import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import { listarConversaciones } from '../../../api/mensajesApi';
import { listarUsuariosParaComite } from '../../../api/comiteApi';
import type { Usuario } from '../../../types';

/**
 * Lista de conversaciones del usuario actual, ordenadas por mensaje más
 * reciente. Incluye conteo de no leídos y datos del otro usuario.
 */
export function useChats() {
  const { usuario } = useAuth();

  const convs = useQuery({
    queryKey: ['conversaciones', usuario?.id],
    queryFn: () =>
      usuario ? listarConversaciones(usuario.id) : Promise.resolve([]),
    enabled: !!usuario,
    refetchInterval: 3000,
  });

  const usuarios = useQuery({
    queryKey: ['usuarios:todos'],
    queryFn: listarUsuariosParaComite,
  });

  const mapaUsuarios = useMemo(() => {
    const m = new Map<string, Usuario>();
    (usuarios.data ?? []).forEach((u) => m.set(u.id, u));
    return m;
  }, [usuarios.data]);

  return {
    state: {
      conversaciones: convs.data ?? [],
      cargando: convs.isLoading,
      mapaUsuarios,
      usuario,
    },
  };
}
