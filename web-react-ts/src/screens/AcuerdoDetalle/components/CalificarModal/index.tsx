import { useState } from 'react';
import Modal from '../../../../components/Modal';
import Button from '../../../../components/Button';
import TextArea from '../../../../components/TextArea';
import StarRating from '../../../../components/StarRating';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: (input: { estrellas: number; resena?: string }) => void;
  cargando?: boolean;
  /** A quién se está calificando — 'productor' o 'comprador'. */
  destinatario?: 'productor' | 'comprador';
  /** Nombre de la contraparte, para personalizar el texto. */
  nombreContraparte?: string;
}

export default function CalificarModal({
  abierto,
  onCerrar,
  onConfirmar,
  cargando,
  destinatario = 'productor',
  nombreContraparte,
}: Props) {
  const [estrellas, setEstrellas] = useState(5);
  const [resena, setResena] = useState('');

  const titulo =
    destinatario === 'productor'
      ? 'Califica al productor'
      : 'Califica al comprador';
  const descripcion =
    destinatario === 'productor'
      ? `Tu calificación ayuda a otros compradores a confiar en ${
          nombreContraparte ?? 'este productor'
        }.`
      : `Tu calificación ayuda a otros productores a saber que ${
          nombreContraparte ?? 'este comprador'
        } es serio y confiable.`;

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">{descripcion}</p>
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-bg-alt py-4">
          <StarRating valor={estrellas} onCambio={setEstrellas} tamano="lg" />
          <p className="text-sm font-semibold text-primary-dark">
            {estrellas} de 5 estrellas
          </p>
        </div>
        <TextArea
          label="Reseña (opcional)"
          placeholder="Cuenta qué tal estuvo el producto y el trato…"
          rows={4}
          value={resena}
          onChange={(e) => setResena(e.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variante="ghost" onClick={onCerrar} type="button">
            Cancelar
          </Button>
          <Button
            cargando={cargando}
            onClick={() =>
              onConfirmar({ estrellas, resena: resena.trim() || undefined })
            }
          >
            Enviar calificación
          </Button>
        </div>
      </div>
    </Modal>
  );
}
