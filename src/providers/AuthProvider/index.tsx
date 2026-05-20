import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../../types';
import {
  cerrarSesion as cerrarSesionLS,
  guardarSesion,
  obtenerUsuarioActual,
} from '../../api/authApi';
import { AuthContext } from './context';

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(async () => {
    const actual = await obtenerUsuarioActual();
    setUsuario(actual);
  }, []);

  useEffect(() => {
    (async () => {
      await refrescar();
      setCargando(false);
    })();
  }, [refrescar]);

  const iniciarSesion = useCallback((u: Usuario) => {
    guardarSesion(u.id);
    setUsuario(u);
  }, []);

  const cerrarSesion = useCallback(() => {
    cerrarSesionLS();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, refrescar }}>
      {children}
    </AuthContext.Provider>
  );
}
