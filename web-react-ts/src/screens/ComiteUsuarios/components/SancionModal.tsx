import { useState } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import TextArea from '../../../components/TextArea';
import Input from '../../../components/Input';
import type { SancionTipo } from '../hooks/useComiteUsuarios';

const CONFIG: Record<
  SancionTipo,
  {
    titulo: string;
    descripcion: string;
    textoBoton: string;
    peligro?: boolean;
    requiereDuracion?: boolean;
  }
> = {
  advertencia: {
    titulo: 'Enviar advertencia',
    descripcion:
      'El usuario recibirá una notificación. La advertencia queda registrada en la bitácora.',
    textoBoton: 'Enviar advertencia',
  },
  suspension_temporal: {
    titulo: 'Suspender temporalmente',
    descripcion:
      'La cuenta queda bloqueada durante los días indicados. Al vencer, se reactiva automáticamente al iniciar sesión.',
    textoBoton: 'Suspender',
    requiereDuracion: true,
    peligro: true,
  },
  cancelacion_permanente: {
    titulo: 'Cancelar cuenta permanentemente',
    descripcion:
      'La cuenta queda cancelada y el DPI queda marcado para que no pueda registrarse otra cuenta. Esta acción no se puede deshacer.',
    textoBoton: 'Cancelar cuenta',
    peligro: true,
  },
  reactivacion: {
    titulo: 'Reactivar cuenta',
    descripcion:
      'La cuenta volverá a estado activo inmediatamente. El motivo queda registrado.',
    textoBoton: 'Reactivar',
  },
};

interface Props {
  tipo: SancionTipo | null;
  onCerrar: () => void;
  onConfirmar: (input: {
    tipo: SancionTipo;
    motivo: string;
    duracionDias?: number;
  }) => void;
  cargando?: boolean;
}

export default function SancionModal({
  tipo,
  onCerrar,
  onConfirmar,
  cargando,
}: Props) {
  const [motivo, setMotivo] = useState('');
  const [duracion, setDuracion] = useState(7);
  if (!tipo) return null;
  const cfg = CONFIG[tipo];
  const valido =
    motivo.trim().length >= 3 &&
    (!cfg.requiereDuracion || (duracion >= 1 && duracion <= 365));

  return (
    <Modal abierto={!!tipo} onCerrar={onCerrar} titulo={cfg.titulo}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">{cfg.descripcion}</p>
        <TextArea
          label="Motivo"
          placeholder="Describe el motivo con claridad…"
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        {cfg.requiereDuracion && (
          <Input
            label="Duración (días)"
            type="number"
            min={1}
            max={365}
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
          />
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variante="ghost" onClick={onCerrar} type="button">
            Cancelar
          </Button>
          <Button
            variante={cfg.peligro ? 'danger' : 'primary'}
            disabled={!valido}
            cargando={cargando}
            onClick={() =>
              onConfirmar({
                tipo,
                motivo: motivo.trim(),
                duracionDias: cfg.requiereDuracion ? duracion : undefined,
              })
            }
          >
            {cfg.textoBoton}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
