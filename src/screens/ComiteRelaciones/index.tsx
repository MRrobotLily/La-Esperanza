import { Link } from 'react-router-dom';
import Screen from '../../layout/Screen';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import EstadoBadge from '../../components/EstadoBadge';
import Badge from '../../components/Badge';
import Input from '../../components/Input';
import {
  fmtFechaHora,
  fmtQuetzales,
  iniciales,
} from '../../utils/format';
import { useComiteRelaciones, type ParRelacion } from './hooks/useComiteRelaciones';

export default function ComiteRelaciones() {
  const { state, handler } = useComiteRelaciones();

  return (
    <Screen
      titulo="Relaciones productor ↔ comprador"
      subtitulo="Visualiza las interacciones entre productores y compradores: acuerdos y mensajes. Solo lectura, para garantizar transparencia."
    >
      {/* Buscador + contador */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="md:w-96">
          <Input
            label="Buscar"
            placeholder="Busca por nombre o municipio…"
            value={state.busqueda}
            onChange={(e) => handler.setBusqueda(e.target.value)}
          />
        </div>
        <Badge tono="primary">
          {state.pares.length} / {state.totalPares} relaciones
        </Badge>
      </div>

      {state.cargando ? (
        <Loader texto="Cargando relaciones…" />
      ) : state.totalPares === 0 ? (
        <VacioEstado
          icono="🔗"
          titulo="Aún no hay interacciones"
          descripcion="Cuando un comprador envíe una solicitud a un productor, verás la relación aquí."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          {/* Listado de pares */}
          <aside className="flex flex-col gap-3">
            {state.pares.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 text-sm text-ink-muted shadow-soft">
                Ningún par coincide con la búsqueda.
              </p>
            ) : (
              state.pares.map((par) => (
                <TarjetaPar
                  key={`${par.productorId}:${par.compradorId}`}
                  par={par}
                  activo={
                    state.seleccionado ===
                    `${par.productorId}::${par.compradorId}`
                  }
                  onSeleccionar={() => handler.seleccionar(par)}
                />
              ))
            )}
          </aside>

          {/* Detalle del par activo */}
          <section className="min-w-0">
            {!state.parActivo ? (
              <div className="flex h-full min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-line bg-white/60 p-8 text-center">
                <div>
                  <p className="text-4xl">👈</p>
                  <p className="mt-2 font-display text-lg font-semibold text-primary-dark">
                    Selecciona una relación
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Elige un par productor↔comprador para ver sus acuerdos y
                    conversaciones.
                  </p>
                </div>
              </div>
            ) : (
              <DetallePar
                par={state.parActivo}
                mensajes={state.mensajes}
                cargandoMensajes={state.cargandoMensajes}
              />
            )}
          </section>
        </div>
      )}
    </Screen>
  );
}

// ─── Componente: tarjeta resumen del par ───────────────────────────

function TarjetaPar({
  par,
  activo,
  onSeleccionar,
}: {
  par: ParRelacion;
  activo: boolean;
  onSeleccionar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSeleccionar}
      className={[
        'flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-all',
        activo
          ? 'border-primary bg-primary-soft/30 shadow-soft'
          : 'border-line bg-white hover:border-primary-light hover:shadow-soft',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <AvatarMini usuario={par.productor} rol="productor" />
        <span className="text-xl text-ink-muted">↔</span>
        <AvatarMini usuario={par.comprador} rol="comprador" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-bg-alt p-2">
          <p className="text-ink-light">🧑‍🌾 Productor</p>
          <p className="truncate font-semibold text-ink">
            {par.productor
              ? `${par.productor.nombre} ${par.productor.apellido}`
              : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-bg-alt p-2">
          <p className="text-ink-light">🛒 Comprador</p>
          <p className="truncate font-semibold text-ink">
            {par.comprador
              ? `${par.comprador.nombre} ${par.comprador.apellido}`
              : '—'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <Badge tono="primary">📋 {par.totalAcuerdos} acuerdos</Badge>
        {par.totalFinalizados > 0 && (
          <Badge tono="success">✅ {par.totalFinalizados}</Badge>
        )}
        {par.totalCanceladosRechazados > 0 && (
          <Badge tono="danger">✖ {par.totalCanceladosRechazados}</Badge>
        )}
      </div>
      <p className="text-[11px] text-ink-light">
        Última interacción · {fmtFechaHora(par.ultimaInteraccion)}
      </p>
    </button>
  );
}

function AvatarMini({
  usuario,
  rol,
}: {
  usuario?: { nombre: string; apellido: string; fotoPerfil?: string };
  rol: 'productor' | 'comprador';
}) {
  const color = rol === 'productor' ? 'bg-primary' : 'bg-accent';
  if (usuario?.fotoPerfil) {
    return (
      <img
        src={usuario.fotoPerfil}
        alt={usuario.nombre}
        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${color} text-sm font-bold text-white`}
    >
      {usuario ? iniciales(usuario.nombre, usuario.apellido) : '?'}
    </div>
  );
}

// ─── Componente: detalle del par seleccionado ──────────────────────

function DetallePar({
  par,
  mensajes,
  cargandoMensajes,
}: {
  par: ParRelacion;
  mensajes: import('../../types').Mensaje[];
  cargandoMensajes: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <AvatarMini usuario={par.productor} rol="productor" />
          <div>
            <p className="text-xs text-ink-light">Productor</p>
            <p className="font-semibold text-ink">
              {par.productor
                ? `${par.productor.nombre} ${par.productor.apellido}`
                : '—'}
            </p>
            {par.productor?.municipio && (
              <p className="text-xs text-ink-muted">
                {par.productor.municipio}, {par.productor.departamento}
              </p>
            )}
          </div>
        </div>
        <div className="text-2xl text-ink-light">↔</div>
        <div className="flex items-center gap-3">
          <AvatarMini usuario={par.comprador} rol="comprador" />
          <div>
            <p className="text-xs text-ink-light">Comprador</p>
            <p className="font-semibold text-ink">
              {par.comprador
                ? `${par.comprador.nombre} ${par.comprador.apellido}`
                : '—'}
            </p>
            {par.comprador?.municipio && (
              <p className="text-xs text-ink-muted">
                {par.comprador.municipio}, {par.comprador.departamento}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Acuerdos */}
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <h3 className="mb-3 font-display text-lg font-semibold text-primary-dark">
          📋 Acuerdos entre ambos ({par.acuerdos.length})
        </h3>
        <ul className="flex flex-col gap-2">
          {par.acuerdos
            .slice()
            .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
            .map((a) => (
              <li key={a.id}>
                <Link
                  to={`/acuerdos/${a.id}`}
                  className="flex flex-col gap-2 rounded-2xl border border-line p-3 transition-all hover:border-primary-light md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-ink-light">
                      #{a.id.slice(-6).toUpperCase()} ·{' '}
                      {fmtFechaHora(a.creadoEn)}
                    </p>
                    <p className="truncate text-sm font-medium text-ink">
                      {a.items
                        .slice(0, 2)
                        .map((i) => `${i.nombreProducto} ×${i.cantidad}`)
                        .join(', ')}
                      {a.items.length > 2 && ` +${a.items.length - 2} más`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary-dark">
                      {fmtQuetzales(a.total)}
                    </span>
                    <EstadoBadge estado={a.estado} />
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </div>

      {/* Mensajes */}
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-primary-dark">
          💬 Conversación ({mensajes.length} mensajes)
          <Badge tono="neutral">Solo lectura</Badge>
        </h3>
        {cargandoMensajes ? (
          <Loader texto="Cargando mensajes…" />
        ) : mensajes.length === 0 ? (
          <p className="rounded-2xl bg-bg-alt p-4 text-sm text-ink-muted">
            Aún no han cruzado mensajes por el chat interno. Podrían estar
            comunicándose por WhatsApp.
          </p>
        ) : (
          <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-2">
            {mensajes.map((m) => {
              const esProductor = m.remitenteId === par.productorId;
              return (
                <li
                  key={m.id}
                  className={[
                    'flex flex-col gap-1 rounded-2xl p-3',
                    esProductor
                      ? 'self-start bg-primary-soft/60 text-ink'
                      : 'self-end bg-accent-light/50 text-ink',
                    'max-w-[85%]',
                  ].join(' ')}
                >
                  <p className="text-[11px] font-semibold text-ink-muted">
                    {esProductor
                      ? par.productor
                        ? `${par.productor.nombre} ${par.productor.apellido}`
                        : 'Productor'
                      : par.comprador
                      ? `${par.comprador.nombre} ${par.comprador.apellido}`
                      : 'Comprador'}{' '}
                    · {fmtFechaHora(m.creadoEn)}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{m.texto}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
