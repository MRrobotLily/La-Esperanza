import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Tamano = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  bloque?: boolean;
  izquierda?: ReactNode;
  derecha?: ReactNode;
  cargando?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] select-none';

const estilos: Record<Variante, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-soft focus:ring-2 focus:ring-primary-light/50',
  secondary:
    'bg-bg-alt text-primary-dark hover:bg-line border border-line',
  outline:
    'bg-transparent text-primary border border-primary hover:bg-primary/5',
  danger:
    'bg-danger text-white hover:bg-danger/90 shadow-soft',
  ghost:
    'bg-transparent text-ink hover:bg-bg-alt',
};

const tamanos: Record<Tamano, string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3.5',
};

export default function Button({
  variante = 'primary',
  tamano = 'md',
  bloque,
  izquierda,
  derecha,
  cargando,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={[
        base,
        estilos[variante],
        tamanos[tamano],
        bloque ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
      disabled={disabled || cargando}
      {...rest}
    >
      {cargando ? (
        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      ) : (
        izquierda
      )}
      <span>{children}</span>
      {!cargando && derecha}
    </button>
  );
}
