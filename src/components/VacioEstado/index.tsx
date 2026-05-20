import type { ReactNode } from 'react';

interface Props {
  icono?: ReactNode;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export default function VacioEstado({ icono = '🌱', titulo, descripcion, accion }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <div className="text-4xl">{icono}</div>
      <h3 className="font-display text-xl text-primary-dark">{titulo}</h3>
      {descripcion && <p className="max-w-md text-sm text-ink-muted">{descripcion}</p>}
      {accion}
    </div>
  );
}
