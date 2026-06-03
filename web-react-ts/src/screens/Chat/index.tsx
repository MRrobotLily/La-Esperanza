import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import { fmtFechaHora, iniciales } from '../../utils/format';
import { useChat } from './hooks/useChat';

export default function Chat() {
  const { state, handler } = useChat();

  if (state.cargando) return <Loader texto="Cargando conversación…" />;
  if (!state.otro) {
    return (
      <VacioEstado
        icono="❓"
        titulo="No encontramos al usuario"
        descripcion="Puede que haya sido eliminado o no tengas acceso."
      />
    );
  }

  const otro = state.otro;
  const yo = state.usuario!;

  return (
    <div className="flex h-[calc(100dvh-80px)] flex-col overflow-hidden rounded-2xl border border-line bg-white md:h-[70vh]">
      {/* Encabezado */}
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <Link
          to="/chats"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-bg-alt md:hidden"
          aria-label="Volver"
        >
          ←
        </Link>
        {otro.fotoPerfil ? (
          <img
            src={otro.fotoPerfil}
            alt={otro.nombre}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {iniciales(otro.nombre, otro.apellido)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">
            {otro.nombre} {otro.apellido}
          </p>
          <p className="text-xs text-ink-muted capitalize">{otro.rol}</p>
        </div>
        {state.acuerdoId && (
          <Link
            to={`/acuerdos/${state.acuerdoId}`}
            className="rounded-lg border border-primary bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary-soft/60"
          >
            📋 Ver acuerdo
          </Link>
        )}
      </div>

      {/* Mensajes */}
      <div
        ref={state.scrollRef}
        className="flex-1 overflow-y-auto bg-bg-alt/50 px-3 py-4"
      >
        {state.mensajes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="text-5xl">👋</span>
            <p className="text-sm font-semibold text-ink">
              Empieza la conversación con {otro.nombre}
            </p>
            <p className="max-w-sm text-xs text-ink-muted">
              Negocien cantidades, precio, punto y horario de entrega. El pago
              siempre es presencial.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {state.mensajes.map((m) => {
              const mio = m.remitenteId === yo.id;
              return (
                <li key={m.id} className={`flex ${mio ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={[
                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                      mio
                        ? 'rounded-br-sm bg-primary text-white'
                        : 'rounded-bl-sm bg-white text-ink shadow-soft',
                    ].join(' ')}
                  >
                    <p className="whitespace-pre-line break-words">{m.texto}</p>
                    <p
                      className={[
                        'mt-1 text-right text-[10px]',
                        mio ? 'text-white/70' : 'text-ink-light',
                      ].join(' ')}
                    >
                      {fmtFechaHora(m.creadoEn)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handler.enviar();
        }}
        className="flex items-center gap-2 border-t border-line bg-white p-2"
      >
        <input
          type="text"
          placeholder="Escribe un mensaje…"
          value={state.texto}
          onChange={(e) => handler.setTexto(e.target.value)}
          className="flex-1 rounded-full border border-line bg-bg-alt px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-light/30"
        />
        <button
          type="submit"
          disabled={!state.texto.trim() || state.enviando}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-40"
          aria-label="Enviar"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
