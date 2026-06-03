import { useState } from 'react';
import SelectorFoto from '../../../../components/SelectorFoto';

interface Props {
  onFoto: (dataUrl: string) => void;
  fotoActual?: string;
}

/**
 * Captura de foto del DPI usando el SelectorFoto común.
 * Permite al usuario elegir entre cámara o galería (útil en escritorio,
 * donde "tomar foto" no tiene sentido).
 */
export default function DPICapture({ onFoto, fotoActual }: Props) {
  const [preview, setPreview] = useState<string | undefined>(fotoActual);

  const aceptar = (url: string) => {
    setPreview(url);
    onFoto(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-bg-alt">
        {preview ? (
          <img src={preview} alt="DPI" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <span className="text-4xl">🪪</span>
            <p className="text-sm font-semibold text-ink">
              Toma o sube una foto del frente del DPI
            </p>
            <p className="text-xs text-ink-muted">
              Asegúrate que se lea claramente el número y los datos.
            </p>
          </div>
        )}
      </div>
      <SelectorFoto
        onFoto={aceptar}
        textoAccion="Tomar o subir foto del DPI"
        textoReemplazar="Reemplazar foto"
        yaHayFoto={!!preview}
      />
    </div>
  );
}
