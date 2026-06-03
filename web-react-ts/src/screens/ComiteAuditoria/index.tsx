import Screen from '../../layout/Screen';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import { TIPO_AUDITORIA_LABEL } from '../../api/comiteApi';
import { fmtFechaHora } from '../../utils/format';
import type { TipoAuditoria } from '../../types';
import { useComiteAuditoria } from './hooks/useComiteAuditoria';

const TONOS: Record<TipoAuditoria, 'success' | 'warning' | 'danger' | 'neutral' | 'primary'> = {
  advertencia: 'warning',
  observacion: 'neutral',
  suspension_temporal: 'warning',
  cancelacion_permanente: 'danger',
  reactivacion: 'success',
};

export default function ComiteAuditoria() {
  const { state, handler } = useComiteAuditoria();

  return (
    <Screen
      titulo="Bitácora de auditoría"
      subtitulo="Historial completo de acciones del comité."
    >
      <div className="mb-4 max-w-xs">
        <Select
          label="Filtrar por tipo"
          value={state.filtroTipo}
          onChange={(e) =>
            handler.setFiltroTipo(e.target.value as TipoAuditoria | 'todos')
          }
        >
          <option value="todos">Todos</option>
          {Object.entries(TIPO_AUDITORIA_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>

      {state.cargando ? (
        <Loader texto="Cargando bitácora…" />
      ) : state.lista.length === 0 ? (
        <VacioEstado
          icono="📜"
          titulo="Sin registros"
          descripcion="Aquí verás todas las acciones del comité: advertencias, suspensiones, cancelaciones y reactivaciones."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {state.lista.map((r) => {
            const afectado = state.mapa.get(r.usuarioAfectadoId);
            const comite = state.mapa.get(r.comiteId);
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Badge tono={TONOS[r.tipo]}>
                    {TIPO_AUDITORIA_LABEL[r.tipo]}
                  </Badge>
                  <span className="text-[11px] text-ink-light">
                    {fmtFechaHora(r.creadoEn)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink">
                  <strong>Usuario afectado:</strong>{' '}
                  {afectado
                    ? `${afectado.nombre} ${afectado.apellido} (${afectado.rol})`
                    : r.usuarioAfectadoId}
                </p>
                <p className="text-sm text-ink">
                  <strong>Comité:</strong>{' '}
                  {comite ? `${comite.nombre} ${comite.apellido}` : r.comiteId}
                </p>
                <p className="mt-1 rounded-lg bg-bg-alt/60 p-2 text-sm text-ink-muted">
                  {r.motivo}
                </p>
                {r.duracionDias && (
                  <p className="mt-1 text-xs text-ink-light">
                    Duración: {r.duracionDias} días
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Screen>
  );
}
