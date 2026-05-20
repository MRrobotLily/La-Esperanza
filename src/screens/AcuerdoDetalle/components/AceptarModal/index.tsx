import { useState } from 'react';
import Modal from '../../../../components/Modal';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import Select from '../../../../components/Select';
import type { TipoEntrega } from '../../../../types';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: (entrega: { tipo: TipoEntrega; punto: string; fecha: string }) => void;
  cargando?: boolean;
  tiposPermitidos?: TipoEntrega[];
}

/**
 * Modal que captura los datos de la entrega cuando el productor acepta
 * una solicitud de compra (DA-03, paso "acordar entrega").
 */
export default function AceptarModal({
  abierto,
  onCerrar,
  onConfirmar,
  cargando,
  tiposPermitidos = ['recoger', 'delivery'],
}: Props) {
  const [tipo, setTipo] = useState<TipoEntrega>(tiposPermitidos[0]);
  const [punto, setPunto] = useState('');
  const [fecha, setFecha] = useState('');

  const valido = punto.trim().length >= 3 && !!fecha;

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Aceptar solicitud y acordar entrega"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          Define el punto y la fecha de entrega. El comprador recibirá una
          notificación con estos datos.
        </p>
        <Select
          label="Tipo de entrega"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoEntrega)}
        >
          {tiposPermitidos.includes('recoger') && (
            <option value="recoger">🚶 Recoger en punto de reunión</option>
          )}
          {tiposPermitidos.includes('delivery') && (
            <option value="delivery">🛵 Delivery (envío)</option>
          )}
        </Select>
        <Input
          label="Punto de entrega"
          placeholder="Ej. Mercado La Esperanza, entrada principal"
          value={punto}
          onChange={(e) => setPunto(e.target.value)}
        />
        <Input
          label="Fecha y hora"
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variante="ghost" onClick={onCerrar} type="button">
            Cancelar
          </Button>
          <Button
            disabled={!valido}
            cargando={cargando}
            onClick={() =>
              onConfirmar({
                tipo,
                punto,
                fecha: new Date(fecha).toISOString(),
              })
            }
          >
            Aceptar y confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
