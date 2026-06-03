import { NavLink } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider/useAuth';

interface Item {
  to: string;
  label: string;
  icono: string;
  end?: boolean;
}

export default function BottomNav() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  const items: Item[] =
    rol === 'productor'
      ? [
          { to: '/catalogo', label: 'Catálogo', icono: '🛍️' },
          { to: '/mis-productos', label: 'Productos', icono: '📦' },
          { to: '/acuerdos', label: 'Ventas', icono: '📋' },
          { to: '/chats', label: 'Chats', icono: '💬' },
          { to: '/perfil', label: 'Perfil', icono: '👤' },
        ]
      : rol === 'comite'
      ? [
          { to: '/comite', label: 'Panel', icono: '📊', end: true },
          { to: '/comite/usuarios', label: 'Usuarios', icono: '👥' },
          { to: '/comite/relaciones', label: 'Relaciones', icono: '🔗' },
          { to: '/comite/auditoria', label: 'Auditoría', icono: '📜' },
          { to: '/perfil', label: 'Perfil', icono: '👤' },
        ]
      : // comprador o visitante
        [
          { to: '/catalogo', label: 'Catálogo', icono: '🛍️' },
          { to: '/carrito', label: 'Carrito', icono: '🛒' },
          { to: '/acuerdos', label: 'Pedidos', icono: '📋' },
          rol === 'comprador'
            ? { to: '/chats', label: 'Chats', icono: '💬' }
            : { to: '/login', label: 'Ingresar', icono: '🔑' },
          { to: '/perfil', label: 'Perfil', icono: '👤' },
        ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to + item.label}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium',
              isActive ? 'text-primary' : 'text-ink-light',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute top-0 h-[3px] w-7 rounded-b-full bg-primary" />
              )}
              <span className="text-xl">{item.icono}</span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
