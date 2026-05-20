import { createContext } from 'react';
import type { Usuario } from '../../types';

export interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  refrescar: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
