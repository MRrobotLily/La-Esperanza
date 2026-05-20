import Screen from '../../layout/Screen';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import Button from '../../components/Button';
import { fmtFechaHora } from '../../utils/format';
import type { TipoNotificacion } from '../../types';
import { useNotificaciones } from './hooks/useNotificaciones';

const ICONOS: Record<TipoNotificacion, string> = {
  solicitud_compra: '🛒',
  acuerdo_aceptado: '✅',
  acuerdo_rechazado: '❌',
  acuerdo_finalizado: '🎉',
  mensaje_nuevo: '💬',
  calificacion: '⭐',
  advertencia_comite: '⚠️',
  suspension_cuenta: '🚫',
  cancelacion_cuenta: '🛑',
};

export default function Notificaciones() {
  const { state, handler } = useNotificaciones();

  if (state.cargando) return <Loader texto="Cargando notificaciones…" />;

  return (
    <Screen
      titulo="Notificaciones"
      subtitulo={
        state.noLeidas > 0
          ? `Tienes ${state.noLeidas} sin leer.`
          : 'Estás al día con tus notificaciones.'
      }
      accion={
        state.noLeidas > 0 && (
          <Button variante="ghost" tamano="sm" onClick={handler.leerTodas}>
            Marcar todas como leídas
          </Button>
        )
      }
    >
      {state.notifs.length === 0 ? (
        <VacioEstado
          icono="🔔"
          titulo="Sin notificaciones todavía"
          descripcion="Te avisaremos cuando recibas una solicitud, mensaje o acuerdo."
        />
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
          {state.notifs.map((n, i) => (
            <li
              key={n.id}
              className={i > 0 ? 'border-t border-line' : ''}
            >
              <button
                type="button"
                onClick={() => handler.abrir(n)}
                className={[
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-alt',
                  !n.leida && 'bg-primary-soft/30',
                ].filter(Boolean).join(' ')}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-alt text-lg">
                  {ICONOS[n.tipo] ?? '🔔'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={[
                        'truncate',
                        n.leida ? 'text-ink-muted' : 'font-semibold text-ink',
                      ].join(' ')}
                    >
                      {n.titulo}
                    </p>
                    {!n.leida && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="truncate text-sm text-ink-muted">{n.mensaje}</p>
                  <p className="mt-0.5 text-[11px] text-ink-light">
                    {fmtFechaHora(n.creadoEn)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
