import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Usuario } from '../../../../types';
import { useAuth } from '../../../../providers/AuthProvider/useAuth';
import { etiquetaRol, iniciales, fmtTelefono } from '../../../../utils/format';

interface Props {
  usuario: Usuario;
}

interface Opcion {
  icono: string;
  texto: string;
  ruta?: string;
  accion?: () => void;
  destacar?: boolean;
  soloRoles?: Usuario['rol'][];
}

/**
 * Dropdown del avatar del usuario. Muestra datos, accesos rápidos
 * contextuales al rol y cierre de sesión.
 * Se cierra al hacer click fuera o presionar Escape.
 */
export default function UserMenu({ usuario }: Props) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();

  useEffect(() => {
    if (!abierto) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [abierto]);

  const opciones: Opcion[] = [
    { icono: '👤', texto: 'Mi perfil', ruta: '/perfil' },
    { icono: '🛒', texto: 'Mi carrito', ruta: '/carrito', soloRoles: ['comprador'] },
    { icono: '📦', texto: 'Mis productos', ruta: '/mis-productos', soloRoles: ['productor'] },
    { icono: '📋', texto: 'Mis acuerdos', ruta: '/acuerdos', soloRoles: ['comprador', 'productor'] },
    { icono: '💬', texto: 'Mis conversaciones', ruta: '/chats', soloRoles: ['comprador', 'productor'] },
    { icono: '🔔', texto: 'Notificaciones', ruta: '/notificaciones' },
    { icono: '📊', texto: 'Panel del Comité', ruta: '/comite', soloRoles: ['comite'] },
    { icono: '⚙️', texto: 'Configuración', ruta: '/configuracion' },
    { icono: '❓', texto: 'Ayuda', ruta: '/ayuda' },
    {
      icono: '🚪',
      texto: 'Cerrar sesión',
      destacar: true,
      accion: () => {
        cerrarSesion();
        navigate('/login', { replace: true });
      },
    },
  ];

  const disponibles = opciones.filter(
    (o) => !o.soloRoles || o.soloRoles.includes(usuario.rol),
  );

  const colorRol =
    usuario.rol === 'productor'
      ? 'bg-primary-soft text-primary-dark'
      : usuario.rol === 'comprador'
      ? 'bg-accent-light/40 text-[#8A6100]'
      : 'bg-[#E8E0F0] text-[#6B4A8A]';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white ring-offset-2 transition-all hover:ring-2 hover:ring-primary-light"
        aria-label="Mi cuenta"
        aria-expanded={abierto}
      >
        {iniciales(usuario.nombre, usuario.apellido)}
      </button>

      {abierto && (
        <div
          className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-line bg-white shadow-xl animate-fadeUp"
          role="menu"
        >
          {/* Encabezado con datos */}
          <div className="border-b border-line bg-gradient-to-br from-primary-soft/40 to-bg-alt px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                {iniciales(usuario.nombre, usuario.apellido)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {fmtTelefono(usuario.telefono)}
                </p>
              </div>
            </div>
            <span
              className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${colorRol}`}
            >
              {etiquetaRol(usuario.rol)}
            </span>
          </div>

          {/* Opciones */}
          <nav className="flex flex-col py-1">
            {disponibles.map((op, i) => {
              const esSalir = op.destacar;
              const content = (
                <>
                  <span className="text-lg">{op.icono}</span>
                  <span className="flex-1">{op.texto}</span>
                </>
              );
              const clase = [
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                esSalir
                  ? 'mt-1 border-t border-line text-danger hover:bg-danger/5'
                  : 'text-ink hover:bg-bg-alt',
              ].join(' ');
              return op.ruta ? (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  className={clase}
                  onClick={() => {
                    setAbierto(false);
                    navigate(op.ruta!);
                  }}
                >
                  {content}
                </button>
              ) : (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  className={clase}
                  onClick={() => {
                    setAbierto(false);
                    op.accion?.();
                  }}
                >
                  {content}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
