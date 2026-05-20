import { Link } from 'react-router-dom';
import Screen from '../../layout/Screen';
import Loader from '../../components/Loader';
import { TIPO_AUDITORIA_LABEL } from '../../api/comiteApi';
import { fmtFechaHora } from '../../utils/format';
import { useComite } from './hooks/useComite';

export default function Comite() {
  const { state } = useComite();
  if (state.cargando || !state.stats) return <Loader texto="Cargando panel…" />;
  const s = state.stats;

  const tarjetas = [
    { titulo: 'Usuarios totales', valor: s.totalUsuarios, icono: '👥', color: 'bg-primary-soft text-primary-dark' },
    { titulo: 'Productores', valor: s.productores, icono: '🧑‍🌾', color: 'bg-accent-light/40 text-[#8A6100]' },
    { titulo: 'Compradores', valor: s.compradores, icono: '🛒', color: 'bg-[#E8E0F0] text-[#6B4A8A]' },
    { titulo: 'Suspendidos', valor: s.suspendidos, icono: '⚠️', color: 'bg-warning/20 text-[#8A6100]' },
    { titulo: 'Cancelados', valor: s.cancelados, icono: '🛑', color: 'bg-danger/15 text-danger' },
    { titulo: 'Productos activos', valor: s.productosActivos, icono: '📦', color: 'bg-primary-soft text-primary-dark' },
    { titulo: 'Acuerdos totales', valor: s.acuerdosTotales, icono: '📋', color: 'bg-bg-alt text-ink' },
    { titulo: 'Acuerdos finalizados', valor: s.acuerdosFinalizados, icono: '✅', color: 'bg-success/15 text-[#1E5132]' },
    { titulo: 'Acuerdos pendientes', valor: s.acuerdosPendientes, icono: '⏳', color: 'bg-warning/15 text-[#8A6100]' },
  ];

  return (
    <Screen
      titulo="Panel del Comité"
      subtitulo="Supervisa usuarios, productos y acuerdos del sistema."
    >
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3">
        {tarjetas.map((t) => (
          <div
            key={t.titulo}
            className={`flex flex-col gap-1 rounded-2xl p-4 shadow-soft ${t.color}`}
          >
            <span className="text-2xl">{t.icono}</span>
            <span className="font-display text-3xl font-bold">{t.valor}</span>
            <span className="text-xs font-medium opacity-80">{t.titulo}</span>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/comite/usuarios"
          className="flex items-center justify-between rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:border-primary-light"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-light">
              Gestión
            </p>
            <h3 className="font-display text-xl font-semibold text-primary-dark">
              Usuarios
            </h3>
            <p className="text-sm text-ink-muted">
              Suspender, cancelar o reactivar cuentas.
            </p>
          </div>
          <span className="text-3xl">👥</span>
        </Link>
        <Link
          to="/comite/relaciones"
          className="flex items-center justify-between rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:border-primary-light"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-light">
              Transparencia
            </p>
            <h3 className="font-display text-xl font-semibold text-primary-dark">
              Relaciones
            </h3>
            <p className="text-sm text-ink-muted">
              Revisa acuerdos y mensajes entre productores y compradores.
            </p>
          </div>
          <span className="text-3xl">🔗</span>
        </Link>
        <Link
          to="/comite/auditoria"
          className="flex items-center justify-between rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:border-primary-light"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-light">
              Bitácora
            </p>
            <h3 className="font-display text-xl font-semibold text-primary-dark">
              Auditoría
            </h3>
            <p className="text-sm text-ink-muted">
              Historial completo de acciones del comité.
            </p>
          </div>
          <span className="text-3xl">📜</span>
        </Link>
      </div>

      {/* Actividad reciente */}
      <div className="rounded-2xl bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-primary-dark">
            Actividad reciente del comité
          </h3>
          <Link
            to="/comite/auditoria"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Ver toda →
          </Link>
        </div>
        {state.recientes.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin registros todavía.</p>
        ) : (
          <ul className="divide-y divide-line">
            {state.recientes.map((r) => (
              <li key={r.id} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {TIPO_AUDITORIA_LABEL[r.tipo]}
                    </p>
                    <p className="truncate text-xs text-ink-muted">{r.motivo}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-light">
                    {fmtFechaHora(r.creadoEn)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Screen>
  );
}
