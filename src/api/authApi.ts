// ──────────────────────────────────────────────────────────────────────────────
// API de autenticación — simula SMS con Twilio y validación de DPI.
// Implementa exactamente el flujo DA-01:
//  - 3 intentos de código → bloqueo 5 min
//  - DPI duplicado: detecta cuenta activa vs suspendida vs nueva
// ──────────────────────────────────────────────────────────────────────────────

import type { CodigoSMS, Rol, Usuario } from '../types';
import { DB_KEYS, delay, nowIso, read, uid, write } from './storage';
import { crearNotificacion } from './notificacionesApi';

const MAX_INTENTOS = 3;
const MINUTOS_BLOQUEO = 5;
const VIGENCIA_CODIGO_MIN = 10;

// Memoria compartida (ventana actual) para poder "leer" el último código
// simulado desde el toast o el modal de demo.
let ultimoCodigoEmitido: { telefono: string; codigo: string } | null = null;

export function getUltimoCodigoSimulado(): { telefono: string; codigo: string } | null {
  return ultimoCodigoEmitido;
}

function getCodigos(): CodigoSMS[] {
  return read<CodigoSMS[]>(DB_KEYS.codigosSMS, []);
}

function setCodigos(data: CodigoSMS[]): void {
  write(DB_KEYS.codigosSMS, data);
}

function getUsuarios(): Usuario[] {
  return read<Usuario[]>(DB_KEYS.usuarios, []);
}

function setUsuarios(data: Usuario[]): void {
  write(DB_KEYS.usuarios, data);
}

export async function enviarCodigoSMS(telefono: string): Promise<{ codigo: string }> {
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const existentes = getCodigos().filter((c) => c.telefono !== telefono);
  const registro: CodigoSMS = {
    telefono,
    codigo,
    intentos: 0,
    creadoEn: nowIso(),
  };
  setCodigos([...existentes, registro]);
  ultimoCodigoEmitido = { telefono, codigo };
  // En producción Twilio enviaría el SMS — en el prototipo lo retornamos.
  return delay({ codigo });
}

export async function verificarCodigoSMS(
  telefono: string,
  codigoIngresado: string,
): Promise<{ ok: true } | { ok: false; motivo: 'invalido' | 'expirado' | 'bloqueado'; restantes?: number; bloqueadoHasta?: string }> {
  const codigos = getCodigos();
  const registro = codigos.find((c) => c.telefono === telefono);
  if (!registro) return delay({ ok: false as const, motivo: 'expirado' as const });

  // Bloqueo activo
  if (registro.bloqueadoHasta && new Date(registro.bloqueadoHasta) > new Date()) {
    return delay({ ok: false as const, motivo: 'bloqueado' as const, bloqueadoHasta: registro.bloqueadoHasta });
  }

  // Expiración
  const edadMin = (Date.now() - new Date(registro.creadoEn).getTime()) / 1000 / 60;
  if (edadMin > VIGENCIA_CODIGO_MIN) {
    return delay({ ok: false as const, motivo: 'expirado' as const });
  }

  if (registro.codigo !== codigoIngresado) {
    registro.intentos += 1;
    if (registro.intentos >= MAX_INTENTOS) {
      registro.bloqueadoHasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60_000).toISOString();
      setCodigos(codigos);
      return delay({ ok: false as const, motivo: 'bloqueado' as const, bloqueadoHasta: registro.bloqueadoHasta });
    }
    setCodigos(codigos);
    return delay({ ok: false as const, motivo: 'invalido' as const, restantes: MAX_INTENTOS - registro.intentos });
  }

  // Éxito → limpiamos el código para que no se reuse.
  setCodigos(codigos.filter((c) => c.telefono !== telefono));
  return delay({ ok: true as const });
}

export interface ValidacionDPI {
  estado: 'libre' | 'activa' | 'suspendida' | 'cancelada';
  usuario?: Usuario;
}

export async function validarDPI(dpi: string): Promise<ValidacionDPI> {
  const usuarios = getUsuarios();
  const match = usuarios.find((u) => u.dpi === dpi);
  if (!match) return delay({ estado: 'libre' as const });
  if (match.estado === 'cancelada') return delay({ estado: 'cancelada' as const, usuario: match });
  if (match.estado === 'suspendida') return delay({ estado: 'suspendida' as const, usuario: match });
  return delay({ estado: 'activa' as const, usuario: match });
}

export interface RegistroDatos {
  telefono: string;
  dpi: string;
  dpiFotoUrl: string;
  nombre: string;
  apellido: string;
  direccion?: string;
  departamento?: string;
  municipio?: string;
  rol: Rol;
}

export async function registrarUsuario(datos: RegistroDatos): Promise<Usuario> {
  const usuarios = getUsuarios();
  const validacion = await validarDPI(datos.dpi);
  if (validacion.estado !== 'libre') {
    throw new Error(
      validacion.estado === 'cancelada'
        ? 'Este DPI tiene una cuenta cancelada y no puede registrarse nuevamente.'
        : validacion.estado === 'suspendida'
        ? 'Este DPI tiene una cuenta suspendida. Contacta al comité.'
        : 'Ya existe una cuenta activa con este DPI.',
    );
  }
  const nuevo: Usuario = {
    id: uid('u_'),
    telefono: datos.telefono,
    dpi: datos.dpi,
    dpiFotoUrl: datos.dpiFotoUrl,
    nombre: datos.nombre,
    apellido: datos.apellido,
    direccion: datos.direccion,
    departamento: datos.departamento,
    municipio: datos.municipio,
    rol: datos.rol,
    estado: 'activa',
    creadoEn: nowIso(),
    actualizadoEn: nowIso(),
  };
  setUsuarios([...usuarios, nuevo]);
  await crearNotificacion({
    usuarioId: nuevo.id,
    tipo: 'advertencia_comite',
    titulo: 'Bienvenido a La Esperanza',
    mensaje: 'Tu cuenta ha sido habilitada. Completa tu perfil para una mejor experiencia.',
  });
  return delay(nuevo);
}

export async function iniciarSesionConTelefono(telefono: string): Promise<Usuario | null> {
  const usuarios = getUsuarios();
  const usuario = usuarios.find((u) => u.telefono === telefono);
  if (!usuario) return delay(null);
  if (usuario.estado === 'cancelada') {
    throw new Error('Esta cuenta ha sido cancelada por el comité.');
  }
  if (usuario.estado === 'suspendida') {
    const expirada = usuario.suspendidoHasta && new Date(usuario.suspendidoHasta) < new Date();
    if (!expirada) {
      throw new Error(
        `Cuenta suspendida hasta ${usuario.suspendidoHasta ? new Date(usuario.suspendidoHasta).toLocaleDateString() : 'nuevo aviso'}.`,
      );
    }
    // Reactivación automática por vencimiento
    usuario.estado = 'activa';
    usuario.suspendidoHasta = undefined;
    usuario.motivoSuspension = undefined;
    usuario.actualizadoEn = nowIso();
    setUsuarios(usuarios);
  }
  return delay(usuario);
}

export function guardarSesion(usuarioId: string): void {
  write(DB_KEYS.sesion, { usuarioId, creadoEn: nowIso() });
}

export function leerSesion(): { usuarioId: string } | null {
  return read<{ usuarioId: string } | null>(DB_KEYS.sesion, null);
}

export function cerrarSesion(): void {
  localStorage.removeItem(DB_KEYS.sesion);
}

export async function obtenerUsuarioActual(): Promise<Usuario | null> {
  const sesion = leerSesion();
  if (!sesion) return null;
  const usuarios = getUsuarios();
  return usuarios.find((u) => u.id === sesion.usuarioId) ?? null;
}

export async function actualizarPerfil(
  id: string,
  cambios: Partial<Pick<Usuario, 'nombre' | 'apellido' | 'direccion' | 'departamento' | 'municipio' | 'fotoPerfil'>>,
): Promise<Usuario> {
  const usuarios = getUsuarios();
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  usuarios[idx] = { ...usuarios[idx], ...cambios, actualizadoEn: nowIso() };
  setUsuarios(usuarios);
  return delay(usuarios[idx]);
}
