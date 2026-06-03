import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../providers/AuthProvider/useAuth';
import { listarNotificaciones } from '../../api/notificacionesApi';
import { leerCarrito } from '../../api/carritoApi';
import UserMenu from './components/UserMenu';

export default function Header() {
  const { usuario } = useAuth();

  const { data: notifs } = useQuery({
    queryKey: ['notificaciones', usuario?.id],
    queryFn: () => (usuario ? listarNotificaciones(usuario.id) : Promise.resolve([])),
    enabled: !!usuario,
    refetchInterval: 5000,
  });

  const { data: carrito } = useQuery({
    queryKey: ['carrito', usuario?.id],
    queryFn: () =>
      usuario?.rol === 'comprador'
        ? leerCarrito(usuario.id)
        : Promise.resolve([]),
    enabled: !!usuario && usuario.rol === 'comprador',
  });

  const noLeidas = (notifs ?? []).filter((n) => !n.leida).length;
  const itemsCarrito = (carrito ?? []).reduce((s, i) => s + i.cantidad, 0);

  const esComprador = usuario?.rol === 'comprador';
  const esProductor = usuario?.rol === 'productor';
  const esComite = usuario?.rol === 'comite';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-soft text-primary-dark'
        : 'text-ink-muted hover:bg-bg-alt',
    ].join(' ');

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light shadow-soft">
            <span className="text-lg">🌿</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-[17px] font-semibold leading-none text-primary-dark">
              La Esperanza
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-light">
              DERCAS
            </p>
          </div>
        </Link>

        <nav className="ml-4 flex flex-1 items-center gap-1">
          <NavLink to="/catalogo" className={linkClass}>
            Catálogo
          </NavLink>
          {esProductor && (
            <NavLink to="/mis-productos" className={linkClass}>
              Mis productos
            </NavLink>
          )}
          {(esProductor || esComprador) && (
            <NavLink to="/acuerdos" className={linkClass}>
              Acuerdos
            </NavLink>
          )}
          {(esProductor || esComprador) && (
            <NavLink to="/chats" className={linkClass}>
              Mensajes
            </NavLink>
          )}
          {esComite && (
            <>
              <NavLink to="/comite" className={linkClass} end>
                Panel
              </NavLink>
              <NavLink to="/comite/usuarios" className={linkClass}>
                Usuarios
              </NavLink>
              <NavLink to="/comite/relaciones" className={linkClass}>
                Relaciones
              </NavLink>
              <NavLink to="/comite/auditoria" className={linkClass}>
                Auditoría
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1">
          {esComprador && (
            <Link
              to="/carrito"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-bg-alt"
              aria-label="Carrito"
            >
              <span className="text-xl">🛒</span>
              {itemsCarrito > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {itemsCarrito}
                </span>
              )}
            </Link>
          )}

          {usuario && (
            <Link
              to="/notificaciones"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-bg-alt"
              aria-label="Notificaciones"
            >
              <span className="text-xl">🔔</span>
              {noLeidas > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {noLeidas}
                </span>
              )}
            </Link>
          )}

          {usuario ? (
            <UserMenu usuario={usuario} />
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-primary-dark"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
