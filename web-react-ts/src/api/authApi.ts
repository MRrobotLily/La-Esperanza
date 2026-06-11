import type { CodigoSMS, Rol, Usuario } from '../types';
import { nowIso, uid, writeSesionLocal, readSesionLocal, removeSesionLocal } from './storage';

const BACKEND_URL = 'https://la-esperanza-production.up.railway.app/api';

let ultimoCodigoEmitido: { telefono: string; codigo: string } | null = null;

export function getUltimoCodigoSimulado(): { telefono: string; codigo: string } | null {
  return ultimoCodigoEmitido;
}

function formatTelefono(telefono: string): string {
  if (telefono.length === 8 && /^\d{8}$/.test(telefono)) {
    return telefono.slice(0, 4) + '-' + telefono.slice(4);
  }
  if (telefono.includes(' ')) {
    return telefono.replace(' ', '-');
  }
  return telefono;
}

export async function enviarCodigoSMS(telefono: string): Promise<{ codigo: string }> {
  const tel = formatTelefono(telefono);
  console.log(`📱 SMS para ${tel}: 123456`);
  ultimoCodigoEmitido = { telefono: tel, codigo: '123456' };
  return { codigo: '123456' };
}

export async function verificarCodigoSMS(
  telefono: string,
  codigoIngresado: string
): Promise<{ valido: boolean; error?: string }> {
  return { valido: true };
}

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
        dpi: data.user.dpi || '',
        estado: 'activo',
        direccion: data.user.direccion || '',
        departamento: data.user.departamento || '',
        municipio: data.user.municipio || '',
        fotoPerfil: data.user.foto_perfil || undefined,
        creadoEn: data.user.created_at || nowIso(),
      } as any;

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

export async function registrarUsuario(
  telefono: string,
  nombre: string,
  apellido: string,
  rol: Rol,
  dpi: string,
  direccion?: string,
  departamento?: string,
  municipio?: string
): Promise<{ usuario: Usuario | null; error?: string }> {
  try {
    const telFormato = formatTelefono(telefono);

    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono: telFormato, nombre, apellido, rol, dpi, direccion, departamento, municipio })
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
        direccion: direccion || '',
        departamento: departamento || '',
        municipio: municipio || '',
        creadoEn: nowIso(),
      } as any;

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

export async function validarDPI(dpi: string): Promise<{ valido: boolean; error?: string }> {
  if (!dpi || dpi.length !== 13) {
    return { valido: false, error: 'DPI debe tener 13 dígitos' };
  }
  if (!/^\d{13}$/.test(dpi)) {
    return { valido: false, error: 'DPI solo números' };
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/users`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        const existe = data.data.find((u: any) => u.dpi === dpi);
        if (existe) {
          const labels: Record<string, string> = {
            productor: 'Productor',
            comprador: 'Comprador',
            comite: 'Comité'
          };
          return { 
            valido: false, 
            error: `Ya existe una cuenta de ${labels[existe.rol] || existe.rol} con este DPI.` 
          };
        }
      }
    }
  } catch (error) {
    console.error('Error verificando DPI:', error);
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
    
    console.log('🐛 Actualizando perfil con datos:', datos);
    
    const response = await fetch(`${BACKEND_URL}/users/${usuarioId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: datos.nombre,
        apellido: datos.apellido,
        direccion: datos.direccion,
        departamento: datos.departamento,
        municipio: datos.municipio,
        foto_perfil: (datos as any).fotoPerfil,
      })
    });
    
    if (!response.ok) {
      return { exito: false, error: 'Error al actualizar en servidor' };
    }
    
    guardarSesion({ ...usuarioActual, ...datos });
    return { exito: true };
  } catch (error) {
    return { exito: false, error: 'Error' };
  }
}