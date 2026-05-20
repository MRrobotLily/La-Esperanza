import type { ReactNode } from 'react';

type Tono = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

interface Props {
  tono?: Tono;
  children: ReactNode;
  izquierda?: ReactNode;
}

const estilos: Record<Tono, string> = {
  primary: 'bg-primary-soft text-primary-dark',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-[#8A6100]',
  danger: 'bg-danger-light text-danger',
  neutral: 'bg-bg-alt text-ink-muted',
  accent: 'bg-accent-light/60 text-[#7A5500]',
};

export default function Badge({ tono = 'neutral', children, izquierda }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        estilos[tono],
      ].join(' ')}
    >
      {izquierda}
      {children}
    </span>
  );
}
