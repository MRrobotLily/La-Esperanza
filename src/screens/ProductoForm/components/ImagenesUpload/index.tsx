import SelectorFoto from '../../../../components/SelectorFoto';

interface Props {
  imagenes: string[];
  onCambio: (imgs: string[]) => void;
  error?: string;
  max?: number;
}

/**
 * Selector múltiple de imágenes del producto (1 a 5).
 * Reutiliza SelectorFoto que ofrece "Tomar foto" o "Subir de galería" y
 * permite seleccionar varios archivos a la vez.
 */
export default function ImagenesUpload({
  imagenes,
  onCambio,
  error,
  max = 5,
}: Props) {
  const agregar = (url: string) => onCambio([...imagenes, url].slice(0, max));
  const agregarVarios = (urls: string[]) =>
    onCambio([...imagenes, ...urls].slice(0, max));
  const quitar = (idx: number) => {
    const nuevo = imagenes.slice();
    nuevo.splice(idx, 1);
    onCambio(nuevo);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-ink">
        Imágenes del producto{' '}
        <span className="text-ink-light">
          (mín 1, máx {max}) — {imagenes.length}/{max}
        </span>
      </label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {imagenes.map((src, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-bg-alt"
          >
            <img
              src={src}
              alt={`img-${i}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => quitar(i)}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
              aria-label="Quitar imagen"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {imagenes.length < max && (
        <SelectorFoto
          onFoto={agregar}
          onMultiples={agregarVarios}
          max={max}
          tomadas={imagenes.length}
          textoAccion={
            imagenes.length === 0 ? 'Agregar fotos del producto' : 'Agregar otra foto'
          }
          yaHayFoto={false}
          variante={imagenes.length === 0 ? 'primary' : 'outline'}
        />
      )}

      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
