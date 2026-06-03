import { Link } from 'react-router-dom';
import Screen from '../../layout/Screen';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import Button from '../../components/Button';
import EstadoBadge from '../../components/EstadoBadge';
import Badge from '../../components/Badge';
import { fmtFechaHora, fmtQuetzales, iniciales } from '../../utils/format';
import AceptarModal from './components/AceptarModal';
import MotivoModal from './components/MotivoModal';
import CalificarModal from './components/CalificarModal';
import { useAcuerdoDetalle } from './hooks/useAcuerdoDetalle';

export default function AcuerdoDetalle() {
  const { state, handler } = useAcuerdoDetalle();

  if (state.cargando) return <Loader texto="Cargando acuerdo…" />;
  if (!state.acuerdo) {
    return (
      <Screen titulo="Acuerdo no encontrado">
        <VacioEstado
          icono="❓"
          titulo="No encontramos este acuerdo"
          descripcion="Puede que haya sido eliminado o no tengas acceso."
          accion={
            <Link
              to="/acuerdos"
              className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Volver a mis acuerdos
            </Link>
          }
        />
      </Screen>
    );
  }

  const a = state.acuerdo;
  const u = state.usuario!;
  const esProductor = u.rol === 'productor';
  const esComprador = u.rol === 'comprador';
  const esComite = u.rol === 'comite';
  const contraparte = state.mapaUsuarios.get(
    esProductor ? a.compradorId : a.productorId,
  );

  // Acciones disponibles según rol y estado
  const puedeAceptar = esProductor && a.estado === 'pendiente';
  const puedeRechazar = esProductor && a.estado === 'pendiente';
  const puedeCancelar =
    (esProductor || esComprador) &&
    ['pendiente', 'aceptado'].includes(a.estado);
  const puedeMarcarEntregado = ['aceptado', 'entregado'].includes(a.estado);
  const yoConfirme = esProductor ? a.confirmadoProductor : a.confirmadoComprador;
  // Calificación bidireccional — productor y comprador califican tras finalizar.
  const puedeCalificar =
    (esComprador || esProductor) &&
    a.estado === 'finalizado' &&
    !state.yaCalifico;
  const textoCalificacion = esProductor
    ? 'Calificar al comprador'
    : 'Calificar al productor';

  return (
    <Screen
      titulo={`Acuerdo #${a.id.slice(-6).toUpperCase()}`}
      subtitulo={`Creado el ${fmtFechaHora(a.creadoEn)}`}
      accion={
        <Link to="/acuerdos" className="text-sm font-medium text-primary">
          ← Volver
        </Link>
      }
    >
      {/* Resumen */}
      <div className="mb-5 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {contraparte?.fotoPerfil ? (
            <img
              src={contraparte.fotoPerfil}
              alt={contraparte.nombre}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
              {contraparte ? iniciales(contraparte.nombre, contraparte.apellido) : '?'}
            </div>
          )}
          <div>
            <p className="text-xs text-ink-light">
              {esProductor ? 'Solicitud de' : 'Productor'}
            </p>
            <p className="font-semibold text-ink">
              {contraparte ? `${contraparte.nombre} ${contraparte.apellido}` : '—'}
            </p>
            {contraparte?.municipio && (
              <p className="text-xs text-ink-muted">
                {contraparte.municipio}, {contraparte.departamento}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <EstadoBadge estado={a.estado} />
          {contraparte && (esProductor || esComprador) && (
            <Link
              to={`/chat/${contraparte.id}?acuerdo=${a.id}`}
              className="rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-soft"
            >
              💬 Mensajear
            </Link>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="mb-5 rounded-3xl bg-white p-5 shadow-soft">
        <h3 className="mb-3 font-display text-lg font-semibold text-primary-dark">
          📦 Productos
        </h3>
        <ul className="divide-y divide-line">
          {a.items.map((i) => (
            <li key={i.productoId} className="flex justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-ink">{i.nombreProducto}</p>
                <p className="text-xs text-ink-muted">
                  {i.cantidad} × {fmtQuetzales(i.precioUnitario)}
                </p>
              </div>
              <p className="font-semibold text-primary-dark">
                {fmtQuetzales(i.subtotal)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <p className="text-sm font-semibold text-ink-muted">Total</p>
          <p className="font-display text-xl font-bold text-primary-dark">
            {fmtQuetzales(a.total)}
          </p>
        </div>
      </div>

      {/* Entrega */}
      {a.entrega && (
        <div className="mb-5 rounded-3xl bg-white p-5 shadow-soft">
          <h3 className="mb-3 font-display text-lg font-semibold text-primary-dark">
            🚚 Entrega acordada
          </h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-ink-light">Tipo</dt>
              <dd className="font-medium capitalize text-ink">
                {a.entrega.tipo === 'delivery' ? '🛵 Delivery' : '🚶 Recoger'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-light">Punto</dt>
              <dd className="font-medium text-ink">{a.entrega.punto}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-light">Fecha y hora</dt>
              <dd className="font-medium text-ink">
                {fmtFechaHora(a.entrega.fecha)}
              </dd>
            </div>
          </dl>
          <div className="mt-3 flex gap-2">
            <Badge tono={a.confirmadoComprador ? 'success' : 'neutral'}>
              {a.confirmadoComprador ? '✅' : '⏳'} Comprador
            </Badge>
            <Badge tono={a.confirmadoProductor ? 'success' : 'neutral'}>
              {a.confirmadoProductor ? '✅' : '⏳'} Productor
            </Badge>
          </div>
        </div>
      )}

      {a.motivoRechazo && (
        <div className="mb-5 rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-semibold text-danger">Motivo</p>
          <p className="text-sm text-ink-muted">{a.motivoRechazo}</p>
        </div>
      )}

      {state.yaCalifico && (
        <div className="mb-5 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm text-[#1E5132]">
          ⭐ Ya calificaste este acuerdo. ¡Gracias!
        </div>
      )}

      {/* Acciones */}
      {!esComite && (
        <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-2xl border border-line bg-white/95 p-3 shadow-soft backdrop-blur md:bottom-4">
          {puedeAceptar && (
            <Button onClick={() => handler.setModal('aceptar')} izquierda={<span>✅</span>}>
              Aceptar solicitud
            </Button>
          )}
          {puedeRechazar && (
            <Button
              variante="outline"
              onClick={() => handler.setModal('rechazar')}
              izquierda={<span>✖️</span>}
            >
              Rechazar
            </Button>
          )}
          {puedeMarcarEntregado && (
            <Button
              disabled={yoConfirme}
              onClick={() => handler.confirmar()}
              izquierda={<span>📦</span>}
              cargando={state.guardando}
            >
              {yoConfirme ? 'Ya confirmaste' : 'Confirmar entrega'}
            </Button>
          )}
          {puedeCancelar && (
            <Button
              variante="ghost"
              onClick={() => handler.setModal('cancelar')}
              izquierda={<span>🛑</span>}
            >
              Cancelar acuerdo
            </Button>
          )}
          {puedeCalificar && (
            <Button
              variante="primary"
              onClick={() => handler.setModal('calificar')}
              izquierda={<span>⭐</span>}
            >
              {textoCalificacion}
            </Button>
          )}
        </div>
      )}

      {/* Modales */}
      <AceptarModal
        abierto={state.modal === 'aceptar'}
        onCerrar={() => handler.setModal(null)}
        onConfirmar={handler.aceptar}
        cargando={state.guardando}
      />
      <MotivoModal
        abierto={state.modal === 'rechazar'}
        onCerrar={() => handler.setModal(null)}
        onConfirmar={handler.rechazar}
        cargando={state.guardando}
        titulo="Rechazar solicitud"
        descripcion="El comprador será notificado del rechazo."
        textoBoton="Confirmar rechazo"
        peligro
      />
      <MotivoModal
        abierto={state.modal === 'cancelar'}
        onCerrar={() => handler.setModal(null)}
        onConfirmar={handler.cancelar}
        cargando={state.guardando}
        titulo="Cancelar acuerdo"
        descripcion="Explica el motivo de la cancelación."
        textoBoton="Cancelar acuerdo"
        peligro
      />
      <CalificarModal
        abierto={state.modal === 'calificar'}
        onCerrar={() => handler.setModal(null)}
        onConfirmar={handler.calificar}
        cargando={state.guardando}
        destinatario={esProductor ? 'comprador' : 'productor'}
        nombreContraparte={
          contraparte ? `${contraparte.nombre} ${contraparte.apellido}` : undefined
        }
      />
    </Screen>
  );
}
