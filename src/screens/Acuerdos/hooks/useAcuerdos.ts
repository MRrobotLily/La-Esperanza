import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../providers/AuthProvider/useAuth';
import { listarAcuerdos } from '../../../api/acuerdosApi';
import { listarUsuariosParaComite } from '../../../api/comiteApi';
import type { EstadoAcuerdo } from '../../../types';

const ESTADOS: (EstadoAcuerdo | 'todos')[] = [
  'todos',
  'pendiente',
  'aceptado',
  'entregado',
  'finalizado',
  'rechazado',
  'cancelado',
];

/**
 * Lista de acuerdos del usuario (comprador o productor) agrupados por estado.
 * El comité ve todos.
 */
export function useAcuerdos() {
  const { usuario } = useAuth();
  const [filtro, setFiltro] = useState<EstadoAcuerdo | 'todos'>('todos');

  const acuerdos = useQuery({
    queryKey: ['acuerdos', usuario?.id],
    queryFn: () =>
      usuario ? listarAcuerdos(usuario.id, usuario.rol) : Promise.resolve([]),
    enabled: !!usuario,
    refetchInterval: 5000,
  });

  const usuarios = useQuery({
    queryKey: ['usuarios:todos'],
    queryFn: listarUsuariosParaComite,
  });

  const mapaUsuarios = useMemo(() => {
    const map = new Map<string, string>();
    (usuarios.data ?? []).forEach((u) =>
      map.set(u.id, `${u.nombre} ${u.apellido}`),
    );
    return map;
  }, [usuarios.data]);

  const lista = (acuerdos.data ?? []).filter(
    (a) => filtro === 'todos' || a.estado === filtro,
  );

  const contadores = (acuerdos.data ?? []).reduce<Record<string, number>>(
    (acc, a) => {
      acc[a.estado] = (acc[a.estado] ?? 0) + 1;
      acc['todos'] = (acc['todos'] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return {
    state: {
      lista,
      estados: ESTADOS,
      filtro,
      contadores,
      cargando: acuerdos.isLoading,
      mapaUsuarios,
      usuario,
    },
    handler: {
      setFiltro,
    },
  };
}
