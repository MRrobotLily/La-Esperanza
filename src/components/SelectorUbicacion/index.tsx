import { useEffect, useMemo } from 'react';
import Select from '../Select';
import { LISTA_DEPARTAMENTOS, municipiosDe } from '../../utils/geografiaGT';

interface Props {
  departamento: string;
  municipio: string;
  onCambioDepartamento: (dep: string) => void;
  onCambioMunicipio: (mun: string) => void;
  errorDepartamento?: string;
  errorMunicipio?: string;
  requerido?: boolean;
}

/**
 * Par de selects enlazados:
 * - Al cambiar de departamento, la lista de municipios se repuebla y el
 *   municipio se limpia si ya no corresponde.
 * - Si no hay departamento elegido, el select de municipio queda deshabilitado.
 */
export default function SelectorUbicacion({
  departamento,
  municipio,
  onCambioDepartamento,
  onCambioMunicipio,
  errorDepartamento,
  errorMunicipio,
  requerido,
}: Props) {
  const municipios = useMemo(() => municipiosDe(departamento), [departamento]);

  // Si el municipio ya no pertenece al departamento elegido, lo limpiamos.
  useEffect(() => {
    if (!departamento) {
      if (municipio) onCambioMunicipio('');
      return;
    }
    if (municipio && !municipios.includes(municipio)) {
      onCambioMunicipio('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departamento]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label={requerido ? 'Departamento *' : 'Departamento'}
        value={departamento}
        onChange={(e) => onCambioDepartamento(e.target.value)}
        error={errorDepartamento}
      >
        <option value="">Selecciona…</option>
        {LISTA_DEPARTAMENTOS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>
      <Select
        label={requerido ? 'Municipio *' : 'Municipio'}
        value={municipio}
        onChange={(e) => onCambioMunicipio(e.target.value)}
        error={errorMunicipio}
        disabled={!departamento}
      >
        <option value="">
          {departamento ? 'Selecciona…' : 'Elige un departamento primero'}
        </option>
        {municipios.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
    </div>
  );
}
