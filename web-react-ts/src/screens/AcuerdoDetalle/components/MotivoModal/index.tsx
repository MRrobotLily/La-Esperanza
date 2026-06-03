import { useState } from 'react';
import Modal from '../../../../components/Modal';
import Button from '../../../../components/Button';
import TextArea from '../../../../components/TextArea';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: (motivo: string) => void;
  cargando?: boolean;
  titulo: string;
  descripcion: string;
  textoBoton: string;
  peligro?: boolean;
}

export default function MotivoModal({
  abierto,
  onCerrar,
  onConfirmar,
  cargando,
  titulo,
  descripcion,
  textoBoton,
  peligro,
}: Props) {
  const [motivo, setMotivo] = useState('');
  const valido = motivo.trim().length >= 3;
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">{descripcion}</p>
        <TextArea
          label="Motivo"
          placeholder="Explica brevemente…"
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variante="ghost" onClick={onCerrar} type="button">
            Cancelar
          </Button>
          <Button
            variante={peligro ? 'danger' : 'primary'}
            disabled={!valido}
            cargando={cargando}
            onClick={() => onConfirmar(motivo)}
          >
            {textoBoton}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
