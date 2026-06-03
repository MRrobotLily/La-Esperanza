interface Props {
  valor: number;            // 0..5, puede ser decimal (4.5)
  tamano?: 'sm' | 'md' | 'lg';
  onCambio?: (v: number) => void;
  etiqueta?: boolean;       // muestra el número al lado
}

const tamanos = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

export default function StarRating({ valor, tamano = 'md', onCambio, etiqueta }: Props) {
  const valorRedondeado = Math.max(0, Math.min(5, valor));
  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${tamanos[tamano]}`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const llena = i <= Math.round(valorRedondeado);
          const clase = llena ? 'text-accent' : 'text-line';
          return (
            <button
              key={i}
              type="button"
              disabled={!onCambio}
              onClick={() => onCambio?.(i)}
              className={[
                'transition-transform',
                clase,
                onCambio ? 'cursor-pointer hover:scale-110' : 'cursor-default',
              ].join(' ')}
              aria-label={`${i} estrellas`}
            >
              ★
            </button>
          );
        })}
      </div>
      {etiqueta && valor > 0 && (
        <span className="text-xs font-medium text-ink-muted">{valorRedondeado.toFixed(1)}</span>
      )}
    </div>
  );
}
