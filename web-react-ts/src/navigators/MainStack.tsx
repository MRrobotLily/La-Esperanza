import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import Page from '../layout/Page';
import Loader from '../components/Loader';
import VacioEstado from '../components/VacioEstado';
import { useAuth } from '../providers/AuthProvider/useAuth';
import type { Usuario } from '../types';

// Pantallas
import Login from '../screens/Login';
import Registro from '../screens/Registro';
import Catalogo from '../screens/Catalogo';
import ProductoDetalle from '../screens/ProductoDetalle';
import MisProductos from '../screens/MisProductos';
import ProductoForm from '../screens/ProductoForm';
import Carrito from '../screens/Carrito';
import Acuerdos from '../screens/Acuerdos';
import AcuerdoDetalle from '../screens/AcuerdoDetalle';
import Chats from '../screens/Chats';
import Chat from '../screens/Chat';
import Perfil from '../screens/Perfil';
import Notificaciones from '../screens/Notificaciones';
import Comite from '../screens/Comite';
import ComiteUsuarios from '../screens/ComiteUsuarios';
import ComiteAuditoria from '../screens/ComiteAuditoria';
import ComiteRelaciones from '../screens/ComiteRelaciones';

// ──────────────────────────────────────────────────────────────
// Guardas de ruta
// ──────────────────────────────────────────────────────────────
interface RutaProps {
  children: ReactNode;
  roles?: Usuario['rol'][];
}

function RutaPrivada({ children, roles }: RutaProps) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Loader />
      </div>
    );
  }
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }
  return <Page>{children}</Page>;
}

function RutaPublica({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth();
  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Loader />
      </div>
    );
  }
  if (usuario) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ──────────────────────────────────────────────────────────────
// Redirección raíz según rol
// ──────────────────────────────────────────────────────────────
function Inicio() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol === 'productor') return <Navigate to="/mis-productos" replace />;
  if (usuario.rol === 'comite') return <Navigate to="/comite" replace />;
  return <Navigate to="/catalogo" replace />;
}

// Pantalla reutilizable para "en construcción" — hoy solo se usa para
// configuración y ayuda; el resto del sprint ya está implementado.
function Proximamente({
  nombre,
  descripcion,
}: {
  nombre: string;
  descripcion?: string;
}) {
  return (
    <VacioEstado
      icono="🚧"
      titulo={`Pantalla "${nombre}" en construcción`}
      descripcion={
        descripcion ??
        'Esta sección se entregará en el siguiente sprint.'
      }
    />
  );
}

// ──────────────────────────────────────────────────────────────
// Stack principal
// ──────────────────────────────────────────────────────────────
export default function MainStack() {
  return (
    <Routes>
      {/* Inicio redirige según rol */}
      <Route path="/" element={<Inicio />} />

      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <RutaPublica>
            <Login />
          </RutaPublica>
        }
      />
      <Route
        path="/registro"
        element={
          <RutaPublica>
            <Registro />
          </RutaPublica>
        }
      />

      {/* Catálogo — accesible para todos los roles autenticados */}
      <Route
        path="/catalogo"
        element={
          <RutaPrivada>
            <Catalogo />
          </RutaPrivada>
        }
      />
      <Route
        path="/producto/:id"
        element={
          <RutaPrivada>
            <ProductoDetalle />
          </RutaPrivada>
        }
      />

      {/* Comprador */}
      <Route
        path="/carrito"
        element={
          <RutaPrivada roles={['comprador']}>
            <Carrito />
          </RutaPrivada>
        }
      />

      {/* Productor */}
      <Route
        path="/mis-productos"
        element={
          <RutaPrivada roles={['productor']}>
            <MisProductos />
          </RutaPrivada>
        }
      />
      <Route
        path="/mis-productos/nuevo"
        element={
          <RutaPrivada roles={['productor']}>
            <ProductoForm />
          </RutaPrivada>
        }
      />
      <Route
        path="/mis-productos/:id/editar"
        element={
          <RutaPrivada roles={['productor']}>
            <ProductoForm />
          </RutaPrivada>
        }
      />

      {/* Acuerdos (comprador + productor + comité) */}
      <Route
        path="/acuerdos"
        element={
          <RutaPrivada>
            <Acuerdos />
          </RutaPrivada>
        }
      />
      <Route
        path="/acuerdos/:id"
        element={
          <RutaPrivada>
            <AcuerdoDetalle />
          </RutaPrivada>
        }
      />

      {/* Mensajería */}
      <Route
        path="/chats"
        element={
          <RutaPrivada>
            <Chats />
          </RutaPrivada>
        }
      />
      <Route
        path="/chat/:otroId"
        element={
          <RutaPrivada>
            <Chat />
          </RutaPrivada>
        }
      />

      {/* Perfil propio */}
      <Route
        path="/perfil"
        element={
          <RutaPrivada>
            <Perfil />
          </RutaPrivada>
        }
      />
      <Route
        path="/perfil/:id"
        element={
          <RutaPrivada>
            <Proximamente
              nombre="Perfil público del productor"
              descripcion="En breve podrás ver calificaciones y productos activos del productor."
            />
          </RutaPrivada>
        }
      />

      {/* Notificaciones */}
      <Route
        path="/notificaciones"
        element={
          <RutaPrivada>
            <Notificaciones />
          </RutaPrivada>
        }
      />

      {/* Comité */}
      <Route
        path="/comite"
        element={
          <RutaPrivada roles={['comite']}>
            <Comite />
          </RutaPrivada>
        }
      />
      <Route
        path="/comite/usuarios"
        element={
          <RutaPrivada roles={['comite']}>
            <ComiteUsuarios />
          </RutaPrivada>
        }
      />
      <Route
        path="/comite/auditoria"
        element={
          <RutaPrivada roles={['comite']}>
            <ComiteAuditoria />
          </RutaPrivada>
        }
      />
      <Route
        path="/comite/relaciones"
        element={
          <RutaPrivada roles={['comite']}>
            <ComiteRelaciones />
          </RutaPrivada>
        }
      />

      {/* Configuración y ayuda — placeholder amable */}
      <Route
        path="/configuracion"
        element={
          <RutaPrivada>
            <Proximamente
              nombre="Configuración"
              descripcion="Preferencias de cuenta, notificaciones e idioma. Próximamente."
            />
          </RutaPrivada>
        }
      />
      <Route
        path="/ayuda"
        element={
          <RutaPrivada>
            <Proximamente
              nombre="Ayuda"
              descripcion="Guías, preguntas frecuentes y contacto con el comité."
            />
          </RutaPrivada>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-bg px-4">
            <VacioEstado
              icono="🧭"
              titulo="Ruta no encontrada"
              descripcion="La página que buscas no existe o fue movida."
            />
          </div>
        }
      />
    </Routes>
  );
}
