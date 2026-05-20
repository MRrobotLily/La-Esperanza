import { useRef, useState } from 'react';
import Button from '../Button';
import Modal from '../Modal';

interface Props {
  onFoto: (dataUrl: string) => void;
  onMultiples?: (dataUrls: string[]) => void;
  max?: number;
  tomadas?: number;
  maxMb?: number;
  textoAccion?: string;
  textoReemplazar?: string;
  yaHayFoto?: boolean;
  /** Si no se pasa, usa default de 3 MB */
  variante?: 'primary' | 'outline';
}

/**
 * Selector de foto con modal de opciones:
 *   - En móvil: "Tomar foto" (capture="environment") | "Subir desde galería"
 *   - En desktop: ambos botones abren el selector de archivo (desktop suele
 *     no tener cámara trasera, pero iOS/Android sí responden a `capture`).
 *
 * El prototipo guarda como dataURL (Base64) dentro de localStorage.
 */
export default function SelectorFoto({
  onFoto,
  onMultiples,
  max = 1,
  tomadas = 0,
  maxMb = 3,
  textoAccion = 'Tomar / subir foto',
  textoReemplazar = 'Reemplazar foto',
  yaHayFoto = false,
  variante = 'primary',
}: Props) {
  const camaraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restantes = Math.max(0, max - tomadas);

  const leerArchivos = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, restantes || 1);
    const urls: string[] = [];
    for (const file of list) {
      if (file.size > maxMb * 1024 * 1024) {
        setError(`Cada imagen debe pesar menos de ${maxMb} MB.`);
        return;
      }
      const url = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      urls.push(url);
    }
    if (onMultiples && urls.length > 1) {
      onMultiples(urls);
    } else if (urls[0]) {
      onFoto(urls[0]);
      if (onMultiples && urls.length === 1) onMultiples(urls);
    }
    setAbierto(false);
  };

  return (
    <>
      <Button
        variante={variante}
        bloque
        onClick={() => setAbierto(true)}
        izquierda={<span>📷</span>}
        type="button"
      >
        {yaHayFoto ? textoReemplazar : textoAccion}
      </Button>

      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}

      {/* Inputs ocultos: uno con capture (cámara) y otro sin (galería) */}
      <input
        ref={camaraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        multiple={max > 1}
        onChange={(e) => leerArchivos(e.target.files)}
      />
      <input
        ref={galeriaRef}
        type="file"
        accept="image/*"
        className="hidden"
        multiple={max > 1}
        onChange={(e) => leerArchivos(e.target.files)}
      />

      <Modal abierto={abierto} onCerrar={() => setAbierto(false)} titulo="Agregar foto">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-muted">
            Elige cómo quieres agregar la foto. {max > 1 && `(te quedan ${restantes})`}
          </p>
          <button
            type="button"
            onClick={() => camaraRef.current?.click()}
            className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-primary hover:bg-primary-soft/30"
          >
            <span className="text-3xl">📸</span>
            <div>
              <p className="font-semibold text-ink">Tomar foto con la cámara</p>
              <p className="text-xs text-ink-muted">
                Usa la cámara trasera de tu dispositivo.
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => galeriaRef.current?.click()}
            className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-primary hover:bg-primary-soft/30"
          >
            <span className="text-3xl">🖼️</span>
            <div>
              <p className="font-semibold text-ink">Subir desde galería</p>
              <p className="text-xs text-ink-muted">
                Elige una imagen guardada en tu dispositivo.
              </p>
            </div>
          </button>
          <p className="text-center text-[11px] text-ink-light">
            Máx {maxMb} MB por imagen
          </p>
        </div>
      </Modal>
    </>
  );
}
