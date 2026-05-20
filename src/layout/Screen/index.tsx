import type { ReactNode } from 'react';

interface Props {
  titulo?: string;
  subtitulo?: string;
  volver?: ReactNode;
  accion?: ReactNode;
  children: ReactNode;
}

export default function Screen({ titulo, subtitulo, volver, accion, children }: Props) {
  return (
    <section className="flex flex-col gap-5">
      {(titulo || accion) && (
        <header className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between md:gap-4">
          <div className="flex flex-col gap-1">
            {volver}
            {titulo && (
              <h1 className="font-display text-[26px] font-semibold leading-tight text-primary-dark md:text-3xl">
                {titulo}
              </h1>
            )}
            {subtitulo && <p className="text-sm text-ink-muted md:text-base">{subtitulo}</p>}
          </div>
          {accion && <div className="shrink-0">{accion}</div>}
        </header>
      )}
      <div className="animate-fade-up">{children}</div>
    </section>
  );
}
