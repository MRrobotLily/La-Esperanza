import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  abierto: boolean;
  titulo?: string;
  onCerrar: () => void;
  tamano?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
}

const tamanos = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
};

export default function Modal({ abierto, titulo, onCerrar, tamano = 'md', children, footer }: Props) {
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 animate-fade-in"
      onClick={onCerrar}
    >
      <div
        className={[
          'w-full rounded-t-2xl bg-white shadow-float sm:rounded-2xl animate-fade-up',
          tamanos[tamano],
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {titulo && (
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="text-base font-semibold text-ink">{titulo}</h3>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="h-8 w-8 rounded-full text-ink-muted hover:bg-bg-alt"
            >
              ✕
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
