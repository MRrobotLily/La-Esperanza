import { Link } from 'react-router-dom';
import Screen from '../../layout/Screen';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import EstadoBadge from '../../components/EstadoBadge';
import { fmtFechaHora, fmtQuetzales, estadoAcuerdoLabel } from '../../utils/format';
import { useAcuerdos } from './hooks/useAcuerdos';

export default function Acuerdos() {
  const { state, handler } = useAcuerdos();
  const u = state.usuario;
  const esProductor = u?.rol === 'productor';

  const tituloPantalla = esProductor
    ? 'Ventas y solicitudes'
    : u?.rol === 'comprador'
    ? 'Mis pedidos'
    : 'Acuerdos';

  return (
    <Screen
      titulo={tituloPantalla}
      subtitulo={
        esProductor
          ? 'Revisa las solicitudes de compra y gestiona las entregas.'
          : 'Aquí verás los acuerdos que hayas iniciado con productores.'
      }
    >
      {/* Filtros por estado */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {state.estados.map((e) => {
          const activo = state.filtro === e;
          const conteo = state.contadores[e] ?? 0;
          return (
            <button
              key={e}
              type="button"
              onClick={() => handler.setFiltro(e)}
              className={[
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold capitalize transition-all',
                activo
                  ? 'border-primary bg-primary text-white shadow-soft'
                  : 'border-line bg-white text-ink-muted hover:border-primary-light',
              ].join(' ')}
            >
              {e === 'todos' ? 'Todos' : estadoAcuerdoLabel(e)}
              {conteo > 0 && (
                <span
                  className={[
                    'ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px]',
                    activo ? 'bg-white/30 text-white' : 'bg-bg-alt text-ink-muted',
                  ].join(' ')}
                >
                  {conteo}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {state.cargando ? (
        <Loader texto="Cargando acuerdos…" />
      ) : state.lista.length === 0 ? (
        <VacioEstado
          icono="📋"
          titulo={
            state.filtro === 'todos'
              ? 'Aún no hay acuerdos'
              : 'No hay acuerdos en este estado'
          }
          descripcion={
            esProductor
              ? 'Las solicitudes de compra aparecerán aquí cuando los compradores te envíen productos.'
              : 'Explora el catálogo y agrega productos al carrito para iniciar una compra.'
          }
          accion={
            !esProductor && (
              <Link
                to="/catalogo"
                className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-primary-dark"
              >
                Ir al catálogo
              </Link>
            )
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {state.lista.map((a) => {
            const otroId = esProductor ? a.compradorId : a.productorId;
            const otroNombre = state.mapaUsuarios.get(otroId) ?? 'Usuario';
            const pendienteConfirmacion =
              a.estado === 'entregado' &&
              ((esProductor && !a.confirmadoProductor) ||
                (!esProductor && !a.confirmadoComprador));
            return (
              <li key={a.id}>
                <Link
                  to={`/acuerdos/${a.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 transition-all hover:border-primary-light hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-ink-light">
                        {esProductor ? 'Comprador' : 'Productor'}
                      </p>
                      <p className="truncate font-semibold text-ink">
                        {otroNombre}
                      </p>
                    </div>
                    <EstadoBadge estado={a.estado} />
                  </div>

                  <ul className="flex flex-wrap gap-1.5">
                    {a.items.slice(0, 3).map((i) => (
                      <span
                        key={i.productoId}
                        className="rounded-full bg-bg-alt px-2 py-0.5 text-[11px] text-ink-muted"
                      >
                        {i.nombreProducto} × {i.cantidad}
                      </span>
                    ))}
                    {a.items.length > 3 && (
                      <span className="rounded-full bg-bg-alt px-2 py-0.5 text-[11px] text-ink-muted">
                        +{a.items.length - 3} más
                      </span>
                    )}
                  </ul>

                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>{fmtFechaHora(a.creadoEn)}</span>
                    <span className="font-semibold text-primary-dark">
                      {fmtQuetzales(a.total)}
                    </span>
                  </div>

                  {pendienteConfirmacion && (
                    <p className="rounded-lg bg-warning/15 px-2 py-1 text-[11px] font-medium text-[#8A6100]">
                      ⏳ Pendiente tu confirmación de entrega
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Screen>
  );
}
