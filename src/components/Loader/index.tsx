interface Props {
  texto?: string;
  centrado?: boolean;
}

export default function Loader({ texto = 'Cargando…', centrado = true }: Props) {
  return (
    <div className={centrado ? 'flex min-h-[200px] flex-col items-center justify-center gap-3' : 'flex items-center gap-2'}>
      <span className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <span className="text-sm text-ink-muted">{texto}</span>
    </div>
  );
}
