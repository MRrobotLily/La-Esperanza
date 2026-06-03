import type { EstadoAcuerdo } from '../../types';
import Badge from '../Badge';

interface Props {
  estado: EstadoAcuerdo;
}

const config: Record<EstadoAcuerdo, { tono: 'warning' | 'success' | 'danger' | 'primary' | 'neutral'; label: string; icon: string }> = {
  pendiente: { tono: 'warning', label: 'Pendiente', icon: '⏳' },
  aceptado: { tono: 'primary', label: 'Aceptado', icon: '✅' },
  rechazado: { tono: 'danger', label: 'Rechazado', icon: '✖' },
  entregado: { tono: 'primary', label: 'En entrega', icon: '🚚' },
  finalizado: { tono: 'success', label: 'Finalizado', icon: '🎉' },
  cancelado: { tono: 'neutral', label: 'Cancelado', icon: '⭕' },
};

export default function EstadoBadge({ estado }: Props) {
  const c = config[estado];
  return (
    <Badge tono={c.tono} izquierda={<span>{c.icon}</span>}>
      {c.label}
    </Badge>
  );
}
