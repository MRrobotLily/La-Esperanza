// ──────────────────────────────────────────────────────────────────────────────
// API del comité — refleja el diagrama DA-04.
// Acciones: advertencia, suspensión temporal, cancelación permanente,
// observación, reactivación. Todas quedan en el log de auditoría.
// ──────────────────────────────────────────────────────────────────────────────

import type { RegistroAuditoria, TipoAuditoria, Usuario } from '../types';
import { DB_KEYS, delay, nowIso, read, uid, write } from './storage';
import { crearNotificacion } from './notificacionesApi';

function getUsuarios(): Usuario[] {
  return read<Usuario[]>(DB_KEYS.usuarios, []);
}

function setUsuarios(data: Usuario[]): void {
  write(DB_KEYS.usuarios, data);
}

function getAuditoria(): RegistroAuditoria[] {
  return read<RegistroAuditoria[]>(DB_KEYS.auditoria, []);
}

function setAuditoria(data: RegistroAuditoria[]): void {
  write(DB_KEYS.auditoria, data);
}

function registrarAuditoria(reg: Omit<RegistroAuditoria, 'id' | 'creadoEn'>): RegistroAuditoria {
  const nuevo: RegistroAuditoria = { ...reg, id: uid('a_'), creadoEn: nowIso() };
  setAuditoria([nuevo, ...getAuditoria()]);
  return nuevo;
}

export async function listarUsuariosParaComite(): Promise<Usuario[]> {
  return delay(getUsuarios().sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn)));
}

export async function advertirUsuario(
  comiteId: string,
  usuarioId: string,
  motivo: string,
): Promise<void> {
  registrarAuditoria({ comiteId, usuarioAfectadoId: usuarioId, tipo: 'advertencia', motivo });
  await crearNotificacion({
    usuarioId,
    tipo: 'advertencia_comite',
    titulo: 'Advertencia del comité',
    mensaje: motivo,
  });
  return delay(undefined);
}

export async function observarUsuario(
  comiteId: string,
  usuarioId: string,
  motivo: string,
): Promise<void> {
  registrarAuditoria({ comiteId, usuarioAfectadoId: usuarioId, tipo: 'observacion', motivo });
  return delay(undefined);
}

export async function suspenderUsuario(
  comiteId: string,
  usuarioId: string,
  motivo: string,
  duracionDias: number,
): Promise<Usuario> {
  const data = getUsuarios();
  const idx = data.findIndex((u) => u.id === usuarioId);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  const hasta = new Date();
  hasta.setDate(hasta.getDate() + duracionDias);
  data[idx] = {
    ...data[idx],
    estado: 'suspendida',
    motivoSuspension: motivo,
    suspendidoHasta: hasta.toISOString(),
    actualizadoEn: nowIso(),
  };
  setUsuarios(data);
  registrarAuditoria({
    comiteId,
    usuarioAfectadoId: usuarioId,
    tipo: 'suspension_temporal',
    motivo,
    duracionDias,
  });
  await crearNotificacion({
    usuarioId,
    tipo: 'suspension_cuenta',
    titulo: 'Tu cuenta fue suspendida',
    mensaje: `Motivo: ${motivo}. Duración: ${duracionDias} días.`,
  });
  return delay(data[idx]);
}

export async function cancelarUsuario(
  comiteId: string,
  usuarioId: string,
  motivo: string,
): Promise<Usuario> {
  const data = getUsuarios();
  const idx = data.findIndex((u) => u.id === usuarioId);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  data[idx] = {
    ...data[idx],
    estado: 'cancelada',
    motivoSuspension: motivo,
    suspendidoHasta: undefined,
    actualizadoEn: nowIso(),
  };
  setUsuarios(data);
  registrarAuditoria({
    comiteId,
    usuarioAfectadoId: usuarioId,
    tipo: 'cancelacion_permanente',
    motivo,
  });
  await crearNotificacion({
    usuarioId,
    tipo: 'cancelacion_cuenta',
    titulo: 'Tu cuenta fue cancelada',
    mensaje: `Motivo: ${motivo}. No podrás crear otra cuenta con este DPI.`,
  });
  return delay(data[idx]);
}

export async function reactivarUsuario(
  comiteId: string,
  usuarioId: string,
  motivo: string,
): Promise<Usuario> {
  const data = getUsuarios();
  const idx = data.findIndex((u) => u.id === usuarioId);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  if (data[idx].estado === 'cancelada') {
    throw new Error('Las cuentas canceladas permanentemente no pueden reactivarse.');
  }
  data[idx] = {
    ...data[idx],
    estado: 'activa',
    motivoSuspension: undefined,
    suspendidoHasta: undefined,
    actualizadoEn: nowIso(),
  };
  setUsuarios(data);
  registrarAuditoria({ comiteId, usuarioAfectadoId: usuarioId, tipo: 'reactivacion', motivo });
  await crearNotificacion({
    usuarioId,
    tipo: 'advertencia_comite',
    titulo: 'Tu cuenta fue reactivada',
    mensaje: motivo,
  });
  return delay(data[idx]);
}

export async function listarAuditoria(): Promise<RegistroAuditoria[]> {
  return delay(getAuditoria());
}

export async function historialUsuario(usuarioId: string): Promise<RegistroAuditoria[]> {
  return delay(getAuditoria().filter((a) => a.usuarioAfectadoId === usuarioId));
}

export const TIPO_AUDITORIA_LABEL: Record<TipoAuditoria, string> = {
  advertencia: 'Advertencia',
  observacion: 'Observación sin sanción',
  suspension_temporal: 'Suspensión temporal',
  cancelacion_permanente: 'Cancelación permanente',
  reactivacion: 'Reactivación',
};

export interface EstadisticasComite {
  totalUsuarios: number;
  productores: number;
  compradores: number;
  suspendidos: number;
  cancelados: number;
  productosActivos: number;
  acuerdosTotales: number;
  acuerdosFinalizados: number;
  acuerdosPendientes: number;
}

export async function estadisticas(): Promise<EstadisticasComite> {
  const usuarios = getUsuarios();
  const productos = read<unknown[]>(DB_KEYS.productos, []) as { activo: boolean }[];
  const acuerdos = read<{ estado: string }[]>(DB_KEYS.acuerdos, []);
  const stats: EstadisticasComite = {
    totalUsuarios: usuarios.length,
    productores: usuarios.filter((u) => u.rol === 'productor').length,
    compradores: usuarios.filter((u) => u.rol === 'comprador').length,
    suspendidos: usuarios.filter((u) => u.estado === 'suspendida').length,
    cancelados: usuarios.filter((u) => u.estado === 'cancelada').length,
    productosActivos: productos.filter((p) => p.activo).length,
    acuerdosTotales: acuerdos.length,
    acuerdosFinalizados: acuerdos.filter((a) => a.estado === 'finalizado').length,
    acuerdosPendientes: acuerdos.filter((a) => a.estado === 'pendiente').length,
  };
  return delay(stats);
}
