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
  variante?: 'primary' | 'outline';
}

// Comprimir imagen a max 400x400 con calidad 0.7
async function comprimirImagen(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
      try {
        // Comprimir cada imagen antes de guardarla
        const url = await comprimirImagen(file);
        urls.push(url);
      } catch (err) {
        setError('Error procesando la imagen.');
        return;
      }
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
            Máx {maxMb} MB por imagen (se comprime automáticamente)
          </p>
        </div>
      </Modal>
    </>
  );
}