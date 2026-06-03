import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import StarRating from '../../components/StarRating';
import ProductoCard from '../../components/ProductoCard';
import Screen from '../../layout/Screen';
import VacioEstado from '../../components/VacioEstado';
import { fmtFecha, fmtQuetzales, emojiCategoria } from '../../utils/format';
import { useProductoDetalle } from './hooks/useProductoDetalle';

export default function ProductoDetalle() {
  const { state, handler } = useProductoDetalle();

  if (state.cargando) return <Screen><Loader /></Screen>;
  if (!state.producto)
    return (
      <Screen>
        <VacioEstado
          titulo="Producto no encontrado"
          descripcion="Puede haber sido retirado del catálogo."
          accion={<Link to="/" className="font-semibold text-primary">← Volver al catálogo</Link>}
        />
      </Screen>
    );

  const p = state.producto;
  const nombreProductor = state.productor
    ? `${state.productor.nombre} ${state.productor.apellido}`
    : 'Productor';

  return (
    <Screen
      volver={
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          ← Catálogo
        </Link>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        {/* Imágenes */}
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
            <img
              src={p.imagenes[0]}
              alt={p.nombre}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          {p.imagenes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {p.imagenes.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Imagen ${i + 1}`}
                  className="h-20 w-28 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Detalle + compra */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge tono="primary">
              {emojiCategoria(p.categoria)} {p.categoria}
            </Badge>
            {!p.activo && <Badge tono="warning">Pausado</Badge>}
          </div>
          <h1 className="font-display text-3xl font-semibold text-primary-dark">{p.nombre}</h1>
          <div className="flex items-center gap-2">
            <StarRating valor={state.promedio} etiqueta />
            <span className="text-xs text-ink-muted">
              ({state.calificaciones.length} reseña{state.calificaciones.length === 1 ? '' : 's'})
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">{p.descripcion}</p>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-light">Precio unitario</p>
              <p className="font-display text-2xl font-semibold text-primary-dark">
                {fmtQuetzales(p.precioUnitario)}
              </p>
              <p className="text-[11px] text-ink-muted">por {p.unidadMedida}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-light">Precio mayor</p>
              <p className="font-display text-2xl font-semibold text-accent">
                {fmtQuetzales(p.precioMayor)}
              </p>
              <p className="text-[11px] text-ink-muted">desde {p.cantidadMayor} {p.unidadMedida}</p>
            </div>
            <div className="col-span-2 border-t border-line pt-3 text-xs text-ink-muted">
              <p>📦 {p.cantidadDisponible} {p.unidadMedida} disponibles</p>
              <p>🚚 Entrega: {p.tiposEntrega.includes('delivery') ? 'Recoger o delivery' : 'Recoger en punto acordado'}</p>
              <p>💵 Pago presencial</p>
            </div>
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft">
            <span className="text-sm font-semibold text-ink">Cantidad</span>
            <button
              type="button"
              onClick={handler.decrementar}
              className="h-10 w-10 rounded-full bg-bg-alt text-lg font-bold text-primary hover:bg-primary-soft"
            >
              −
            </button>
            <input
              type="number"
              value={state.cantidad}
              onChange={(e) => handler.setCantidad(Number(e.target.value) || 1)}
              className="w-20 rounded-xl border border-line bg-bg-alt px-3 py-2 text-center font-semibold outline-none focus:border-primary"
              min={1}
            />
            <button
              type="button"
              onClick={handler.incrementar}
              className="h-10 w-10 rounded-full bg-bg-alt text-lg font-bold text-primary hover:bg-primary-soft"
            >
              +
            </button>
            <span className="ml-auto text-sm text-ink-muted">{p.unidadMedida}</span>
          </div>

          {state.superaStock && (
            <p className="rounded-xl bg-warning-light px-3 py-2 text-xs font-medium text-[#8A6100]">
              ⚠️ La cantidad que pides supera el stock disponible ({p.cantidadDisponible}{' '}
              {p.unidadMedida}). Puedes negociar directamente con el productor.
            </p>
          )}

          <div className="flex items-center justify-between rounded-2xl bg-primary-soft/60 px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-primary-dark">Precio aplicado</p>
              <p className="font-display text-xl font-semibold text-primary-dark">
                {fmtQuetzales(state.precioAplicado)}{' '}
                <span className="text-xs font-normal text-ink-muted">
                  × {state.cantidad}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-primary-dark">Subtotal</p>
              <p className="font-display text-2xl font-semibold text-primary-dark">
                {fmtQuetzales(state.subtotal)}
              </p>
            </div>
          </div>

          <Button
            tamano="lg"
            bloque
            onClick={() => handler.agregarAlCarrito()}
            cargando={state.agregando}
          >
            🛒 Agregar a mi lista
          </Button>

          {state.productor && (
            <Link
              to={`/productor/${state.productor.id}`}
              className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 shadow-soft transition-all hover:shadow-float"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {state.productor.nombre[0]}
                  {state.productor.apellido[0]}
                </div>
                <div>
                  <p className="text-xs text-ink-light">Vendido por</p>
                  <p className="text-sm font-semibold text-ink">{nombreProductor}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-primary">Ver perfil →</span>
            </Link>
          )}
        </div>
      </div>

      {/* Reseñas */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl text-primary-dark">Reseñas</h2>
        {state.calificaciones.length === 0 ? (
          <VacioEstado
            icono="⭐"
            titulo="Sin reseñas todavía"
            descripcion="Sé el primero en comprar y calificar este producto."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {state.calificaciones.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-soft"
              >
                <div className="mb-1 flex items-center justify-between">
                  <StarRating valor={c.estrellas} tamano="sm" />
                  <span className="text-xs text-ink-light">{fmtFecha(c.creadoEn)}</span>
                </div>
                {c.resena && <p className="text-sm text-ink-muted">{c.resena}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </Screen>
  );
}
