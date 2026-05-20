import { useState } from 'react';
import { Link } from 'react-router-dom';
import Screen from '../../layout/Screen';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import Modal from '../../components/Modal';
import { useCarrito } from './hooks/useCarrito';
import { fmtQuetzales } from '../../utils/format';
import type { GrupoCarrito } from './hooks/useCarrito';

export default function Carrito() {
  const { state, handler } = useCarrito();
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<GrupoCarrito | null>(null);

  if (state.cargando) {
    return (
      <Screen titulo="Mi lista de compras">
        <Loader />
      </Screen>
    );
  }

  if (state.vacio) {
    return (
      <Screen titulo="Mi lista de compras">
        <VacioEstado
          icono="🧺"
          titulo="Aún no tienes productos en tu lista"
          descripcion="Esta lista no es una compra: sirve para que le envíes al productor los productos que te interesan. Empieza explorando el catálogo."
          accion={
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-dark"
            >
              🛒 Ir al catálogo
            </Link>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen
      titulo="Mi lista de compras"
      subtitulo="Arma tu pedido y envíaselo al productor. No hay cobro aquí: sólo una solicitud."
    >
      {/* Banner explicativo de "qué es esto" — para usuarios con poca experiencia */}
      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-accent-light/60 bg-accent-light/30 p-3 text-[13px] text-[#5a4300] sm:p-4">
        <span className="text-lg">💡</span>
        <div className="flex-1">
          <p className="font-semibold">¿Cómo funciona esta lista?</p>
          <p className="mt-0.5 leading-relaxed">
            Agrega los productos que te interesan. Cuando termines, puedes{' '}
            <strong>seguir comprando</strong> o <strong>enviar la lista</strong> al productor
            por chat, WhatsApp o como PDF. El productor decidirá si acepta y te lo confirmará.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {state.grupos.map((g) => (
          <div
            key={g.productorId}
            className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
          >
            {/* Encabezado productor */}
            <div className="flex items-center justify-between gap-2 border-b border-line bg-primary-soft px-4 py-3">
              <div className="flex flex-col">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
                  Productor
                </p>
                <p className="text-base font-semibold text-ink">{g.productorNombre}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-dark">
                {g.items.length} {g.items.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            {/* Items */}
            <ul className="divide-y divide-line">
              {g.items.map((it) => (
                <li key={it.producto.id} className="flex gap-3 p-3 sm:p-4">
                  <img
                    src={it.producto.imagenes[0]}
                    alt={it.producto.nombre}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-ink">
                        {it.producto.nombre}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handler.eliminar(it.producto.id)}
                        aria-label="Quitar del carrito"
                        title="Quitar de la lista"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-light text-danger hover:bg-danger/20"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[11px] text-ink-muted">
                      {fmtQuetzales(it.precioAplicado)} / {it.producto.unidadMedida}
                      {it.precioAplicado === it.producto.precioMayor && (
                        <span className="ml-1 rounded bg-accent-light/60 px-1 py-0.5 text-[10px] font-semibold text-[#7A5500]">
                          precio por mayor
                        </span>
                      )}
                    </p>

                    {it.superaStock && (
                      <p className="rounded-md bg-warning/15 px-2 py-1 text-[11px] font-medium text-[#8A6100]">
                        ⚠ Supera lo disponible ({it.producto.cantidadDisponible}{' '}
                        {it.producto.unidadMedida}). Puedes negociarlo con el productor.
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="inline-flex items-center overflow-hidden rounded-xl border border-line">
                        <button
                          type="button"
                          onClick={() => handler.decrementar(it)}
                          className="flex h-9 w-9 items-center justify-center text-lg font-bold text-primary-dark hover:bg-bg-alt"
                          aria-label="Disminuir"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={it.cantidad}
                          onChange={(e) =>
                            handler.cambiarCantidadDirecta(
                              it.producto.id,
                              Math.max(1, Number(e.target.value) || 1),
                            )
                          }
                          className="w-12 border-x border-line bg-white py-1.5 text-center text-sm font-semibold text-ink outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handler.incrementar(it)}
                          className="flex h-9 w-9 items-center justify-center text-lg font-bold text-primary-dark hover:bg-bg-alt"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-base font-semibold text-primary-dark">
                        {fmtQuetzales(it.subtotal)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pie: subtotal + botón para enviar ESTE grupo */}
            <div className="flex flex-col gap-3 border-t border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                <p className="text-xs text-ink-muted">
                  Subtotal con {g.productorNombre}
                </p>
                <p className="font-display text-lg text-primary-dark">
                  {fmtQuetzales(g.subtotal)}
                </p>
              </div>
              <Button
                tamano="md"
                izquierda={<span>📨</span>}
                onClick={() => setGrupoSeleccionado(g)}
              >
                Finalizar con este productor
              </Button>
            </div>
          </div>
        ))}

        {/* Barra de acciones principales — siempre visible abajo */}
        <div className="sticky bottom-20 z-20 mt-2 rounded-2xl border border-primary-light bg-white p-3 shadow-float md:bottom-4">
          <div className="flex items-center justify-between border-b border-line px-2 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
                Total estimado
              </p>
              <p className="font-display text-2xl text-primary-dark">
                {fmtQuetzales(state.totalGlobal)}
              </p>
            </div>
            <button
              type="button"
              onClick={handler.vaciar}
              className="text-xs font-semibold text-ink-light hover:text-danger"
            >
              🗑 Vaciar lista
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              variante="outline"
              tamano="lg"
              izquierda={<span>🛒</span>}
              onClick={handler.seguirComprando}
              className="sm:flex-1"
            >
              Seguir comprando
            </Button>
            <Button
              tamano="lg"
              izquierda={<span>✅</span>}
              onClick={() => {
                if (state.grupos.length === 1) setGrupoSeleccionado(state.grupos[0]);
                else {
                  // Si hay varios productores, el usuario debe elegir por productor.
                  document
                    .querySelector('#grupos-productores')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="sm:flex-1"
            >
              Finalizar compra
            </Button>
          </div>
          {state.grupos.length > 1 && (
            <p className="mt-2 text-center text-[11px] text-ink-muted">
              Tienes productos de {state.grupos.length} productores. Finaliza con cada uno
              por separado.
            </p>
          )}
        </div>
      </div>

      {grupoSeleccionado && (
        <ModalEnviarProductor
          grupo={grupoSeleccionado}
          totalGlobal={state.totalGlobal}
          enviando={state.enviando}
          onCerrar={() => setGrupoSeleccionado(null)}
          onChat={(notas) => {
            handler.enviarPorChat(grupoSeleccionado.productorId, notas);
            setGrupoSeleccionado(null);
          }}
          onWhatsApp={(notas) => {
            handler.enviarPorWhatsApp(grupoSeleccionado.productorId, notas);
            setGrupoSeleccionado(null);
          }}
          onPDF={(notas) => {
            handler.generarPDF(grupoSeleccionado.productorId, notas);
          }}
        />
      )}
    </Screen>
  );
}

// ─── Modal: Cómo enviar la lista al productor ──────────────────────
interface ModalProps {
  grupo: GrupoCarrito;
  totalGlobal: number;
  enviando: boolean;
  onCerrar: () => void;
  onChat: (notas?: string) => void;
  onWhatsApp: (notas?: string) => void;
  onPDF: (notas?: string) => void;
}

function ModalEnviarProductor({
  grupo,
  enviando,
  onCerrar,
  onChat,
  onWhatsApp,
  onPDF,
}: ModalProps) {
  const [notas, setNotas] = useState('');

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={`Enviar lista a ${grupo.productorNombre}`}
      tamano="md"
    >
      <div className="flex flex-col gap-4">
        {/* Resumen de la lista */}
        <div className="rounded-xl border border-line bg-bg-alt p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-light">
            Resumen del pedido
          </p>
          <ul className="text-sm text-ink">
            {grupo.items.map((i) => (
              <li key={i.producto.id} className="flex justify-between py-0.5">
                <span className="truncate pr-2">
                  • {i.producto.nombre} × {i.cantidad} {i.producto.unidadMedida}
                </span>
                <span className="font-semibold text-primary-dark">
                  {fmtQuetzales(i.subtotal)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-sm font-semibold">
            <span>Total</span>
            <span className="text-primary-dark">{fmtQuetzales(grupo.subtotal)}</span>
          </div>
        </div>

        {/* Notas opcionales */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-muted">
            ¿Quieres agregar alguna nota al productor? (opcional)
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej: Prefiero que sea entregado el viernes por la mañana."
            rows={2}
            className="w-full resize-none rounded-xl border border-line bg-white p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light/30"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-ink-muted">
            Elige cómo enviar la lista:
          </p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={enviando}
              onClick={() => onChat(notas || undefined)}
              className="group flex items-center gap-3 rounded-xl border-2 border-primary-light bg-primary-soft p-3 text-left transition-all hover:border-primary hover:bg-primary/10 disabled:opacity-50"
            >
              <span className="text-2xl">💬</span>
              <div className="flex-1">
                <p className="font-semibold text-primary-dark">Mensaje dentro de la app</p>
                <p className="text-[11px] text-ink-muted">
                  Se crea un acuerdo y el listado se envía automáticamente al chat.
                </p>
              </div>
              <span className="text-primary-dark">→</span>
            </button>

            <button
              type="button"
              disabled={enviando}
              onClick={() => onWhatsApp(notas || undefined)}
              className="group flex items-center gap-3 rounded-xl border-2 border-success-light bg-success-light/40 p-3 text-left transition-all hover:border-success hover:bg-success-light disabled:opacity-50"
            >
              <span className="text-2xl">🟢</span>
              <div className="flex-1">
                <p className="font-semibold text-success">Enviar por WhatsApp</p>
                <p className="text-[11px] text-ink-muted">
                  Abre WhatsApp con el listado ya escrito. Sólo tienes que tocar enviar.
                </p>
              </div>
              <span className="text-success">→</span>
            </button>

            <button
              type="button"
              disabled={enviando}
              onClick={() => onPDF(notas || undefined)}
              className="group flex items-center gap-3 rounded-xl border-2 border-line bg-white p-3 text-left transition-all hover:border-accent hover:bg-accent-light/30 disabled:opacity-50"
            >
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="font-semibold text-ink">Descargar como PDF</p>
                <p className="text-[11px] text-ink-muted">
                  Se abre la vista imprimible. Puedes imprimirla o guardarla como PDF.
                </p>
              </div>
              <span className="text-ink-muted">→</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
