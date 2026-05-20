import { Link } from 'react-router-dom';
import Screen from '../../layout/Screen';
import Loader from '../../components/Loader';
import VacioEstado from '../../components/VacioEstado';
import { fmtFechaHora, iniciales } from '../../utils/format';
import { useChats } from './hooks/useChats';

export default function Chats() {
  const { state } = useChats();

  if (state.cargando) return <Loader texto="Cargando conversaciones…" />;

  return (
    <Screen
      titulo="Mensajes"
      subtitulo="Conversaciones con productores y compradores."
    >
      {state.conversaciones.length === 0 ? (
        <VacioEstado
          icono="💬"
          titulo="Aún no hay conversaciones"
          descripcion="Cuando envíes una lista desde el carrito o recibas una solicitud, aparecerá aquí."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {state.conversaciones.map((c) => {
            const otro = state.mapaUsuarios.get(c.otroUsuarioId);
            return (
              <li key={c.otroUsuarioId}>
                <Link
                  to={`/chat/${c.otroUsuarioId}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-alt"
                >
                  {otro?.fotoPerfil ? (
                    <img
                      src={otro.fotoPerfil}
                      alt={otro.nombre}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {otro ? iniciales(otro.nombre, otro.apellido) : '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-ink">
                        {otro ? `${otro.nombre} ${otro.apellido}` : 'Usuario'}
                      </p>
                      <span className="shrink-0 text-[10px] text-ink-light">
                        {fmtFechaHora(c.ultimo.creadoEn)}
                      </span>
                    </div>
                    <p
                      className={[
                        'truncate text-sm',
                        c.noLeidos > 0 ? 'font-semibold text-ink' : 'text-ink-muted',
                      ].join(' ')}
                    >
                      {c.ultimo.remitenteId === state.usuario?.id && 'Tú: '}
                      {c.ultimo.texto}
                    </p>
                  </div>
                  {c.noLeidos > 0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-2 text-[11px] font-bold text-white">
                      {c.noLeidos}
                    </span>
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
