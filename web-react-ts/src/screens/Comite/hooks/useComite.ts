import { useQuery } from '@tanstack/react-query';
import { estadisticas, listarAuditoria } from '../../../api/comiteApi';

export function useComite() {
  const stats = useQuery({
    queryKey: ['comite:stats'],
    queryFn: estadisticas,
    refetchInterval: 5000,
  });
  const auditoria = useQuery({
    queryKey: ['comite:auditoria'],
    queryFn: listarAuditoria,
    refetchInterval: 5000,
  });

  return {
    state: {
      stats: stats.data,
      cargando: stats.isLoading,
      recientes: (auditoria.data ?? []).slice(0, 5),
    },
  };
}
