import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  listarAuditoria,
  listarUsuariosParaComite,
} from '../../../api/comiteApi';
import type { TipoAuditoria, Usuario } from '../../../types';

export function useComiteAuditoria() {
  const [filtroTipo, setFiltroTipo] = useState<TipoAuditoria | 'todos'>('todos');

  const registros = useQuery({
    queryKey: ['comite:auditoria'],
    queryFn: listarAuditoria,
    refetchInterval: 5000,
  });
  const usuarios = useQuery({
    queryKey: ['comite:usuarios'],
    queryFn: listarUsuariosParaComite,
  });

  const mapa = useMemo(() => {
    const m = new Map<string, Usuario>();
    (usuarios.data ?? []).forEach((u) => m.set(u.id, u));
    return m;
  }, [usuarios.data]);

  const lista = (registros.data ?? []).filter(
    (r) => filtroTipo === 'todos' || r.tipo === filtroTipo,
  );

  return {
    state: {
      lista,
      mapa,
      cargando: registros.isLoading,
      filtroTipo,
    },
    handler: { setFiltroTipo },
  };
}
