import type { CodigoSMS, Rol, Usuario } from '../types';
import { nowIso, uid, writeSesionLocal, readSesionLocal, removeSesionLocal } from './storage';

const BACKEND_URL = 'https://la-esperanza-production.up.railway.app/api';

let ultimoCodigoEmitido: { telefono: string; codigo: string } | null = null;

export function getUltimoCodigoSimulado(): { telefono: string; codigo: string } | null {
  return ultimoCodigoEmitido;
}

// Formatear teléfono: "55123456" → "5512-3456"
function formatTelefono(telefono: string): string {
  if (telefono.length === 8 && /^\d{8}$/.test(telefono)) {
    return telefono.slice(0, 4) + '-' + telefono.slice(4);
  }
  if (telefono.includes(' ')) {
    return telefono.replace(' ', '-');
  }
  return telefono;
}

// SMS
export async function enviarCodigoSMS(telefono: string): Promise<{ codigo: string }> {
  const tel = formatTelefono(telefono);
  console.log(`📱 SMS para ${tel}: 123456`);
  ultimoCodigoEmitido = { telefono: tel, codigo: '123456' };
  return { codigo: '123456' };
}

// VERIFICAR CÓDIGO
export async function verificarCodigoSMS(
  telefono: string,
  codigoIngresado: string
): Promise<{ valido: boolean; error?: string }> {
  return { valido: true };
}

// LOGIN
export async function iniciarSesionConTelefono(
  telefono: string,
  codigoIngresado: string
): Promise<{ usuario: Usuario | null; error?: string }> {
  try {
    const telFormato = formatTelefono(telefono);
    console.log('🔐 Login con:', telFormato);

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono: telFormato })
    });

    if (!response.ok) {
      console.log('❌ Usuario no encontrado');
      return { usuario: null, error: 'Usuario no encontrado' };
    }

    const data = await response.json();
    console.log('📊 Backend:', data);

    if (data.success && data.user) {
      const usuario: Usuario = {
        id: data.user.id.toString(),
        telefono: data.user.telefono,
        nombre: data.user.nombre,
        apellido: data.user.apellido,
        rol: data.user.rol,
        dpi: '',
        estado: 'activo',
        creadoEn: data.user.created_at || nowIso(),
      };

      writeSesionLocal('usuarioActual', usuario);
      console.log('✅ Login exitoso');
      return { usuario };
    }

    return { usuario: null, error: 'Error' };
  } catch (error) {
    console.error('❌ Error:', error);
    return { usuario: null, error: String(error) };
  }
}

// REGISTRAR
export async function registrarUsuario(
  telefono: string,
  nombre: string,
  apellido: string,
  rol: Rol,
  dpi: string
): Promise<{ usuario: Usuario | null; error?: string }> {
  try {
    const telFormato = formatTelefono(telefono);

    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono: telFormato, nombre, apellido, rol, dpi })
    });

    if (!response.ok) {
      return { usuario: null, error: 'Error al registrar' };
    }

    const data = await response.json();

    if (data.success) {
      const usuario: Usuario = {
        id: data.userId.toString(),
        telefono: data.telefono,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol,
        dpi: dpi,
        estado: 'activo',
        creadoEn: nowIso(),
      };

      writeSesionLocal('usuarioActual', usuario);
      return { usuario };
    }

    return { usuario: null, error: 'Error' };
  } catch (error) {
    return { usuario: null, error: 'Error de conexión' };
  }
}

export function obtenerUsuarioActual(): Usuario | null {
  return readSesionLocal<Usuario | null>('usuarioActual', null);
}

export function guardarSesion(usuario: Usuario): void {
  writeSesionLocal('usuarioActual', usuario);
}

export function cerrarSesion(): void {
  removeSesionLocal('usuarioActual');
}

export async function cerrarSesionLS(): Promise<void> {
  removeSesionLocal('usuarioActual');
}

export function validarDPI(dpi: string): { valido: boolean; error?: string } {
  if (!dpi || dpi.length !== 13) {
    return { valido: false, error: 'DPI debe tener 13 dígitos' };
  }
  if (!/^\d{13}$/.test(dpi)) {
    return { valido: false, error: 'DPI solo números' };
  }
  return { valido: true };
}

export async function actualizarPerfil(
  usuarioId: string,
  datos: Partial<Usuario>
): Promise<{ exito: boolean; error?: string }> {
  try {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      return { exito: false, error: 'No hay usuario' };
    }
    guardarSesion({ ...usuarioActual, ...datos });
    return { exito: true };
  } catch (error) {
    return { exito: false, error: 'Error' };
  }
}