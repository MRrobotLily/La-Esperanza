// ──────────────────────────────────────────────────────────────────────────────
// Capa de persistencia: Backend (MySQL) + localStorage (cache local)
// IMPORTANTE: read() es síncrono (devuelve cache), readAsync() es para cargar
// ──────────────────────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:3001/api';

export const DB_KEYS = {
  usuarios: 'dercas.usuarios',
  productos: 'dercas.productos',
  acuerdos: 'dercas.acuerdos',
  mensajes: 'dercas.mensajes',
  calificaciones: 'dercas.calificaciones',
  notificaciones: 'dercas.notificaciones',
  auditoria: 'dercas.auditoria',
  codigosSMS: 'dercas.codigosSMS',
  sesion: 'dercas.sesion',
  seed: 'dercas.seed.v2',
} as const;

export type DBKey = (typeof DB_KEYS)[keyof typeof DB_KEYS];

// ──────────────────────────────────────────────────────────────────────────────
// READ SÍNCRONO - Obtener del cache local (localStorage)
// ──────────────────────────────────────────────────────────────────────────────
export function read<T>(key: DBKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// READ ASYNC - Cargar del Backend y cachear en localStorage
// ──────────────────────────────────────────────────────────────────────────────
export async function readAsync<T>(key: DBKey, fallback: T): Promise<T> {
  try {
    const endpoints: Record<DBKey, string> = {
      'dercas.usuarios': '/users',
      'dercas.productos': '/productos',
      'dercas.acuerdos': '/acuerdos',
      'dercas.mensajes': '/mensajes',
      'dercas.calificaciones': '/calificaciones',
      'dercas.notificaciones': '/notificaciones',
      'dercas.auditoria': '/auditoria',
      'dercas.codigosSMS': '/codigos',
      'dercas.sesion': '/sesion',
      'dercas.seed.v2': '/seed',
    };

    const endpoint = endpoints[key];
    if (!endpoint) return read(key, fallback);

    const response = await fetch(`${API_URL}${endpoint}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        // Cachear en localStorage
        localStorage.setItem(key, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (error) {
    console.warn(`Error loading ${key} from backend:`, error);
  }
  
  // Fallback a localStorage
  return read(key, fallback);
}

// ──────────────────────────────────────────────────────────────────────────────
// WRITE - Guardar en localStorage + enviar al backend async
// ──────────────────────────────────────────────────────────────────────────────
export function write<T>(key: DBKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    
    // Enviar al backend sin esperar (fire and forget)
    writeAsync(key, value).catch(err => 
      console.warn(`Sync error for ${key}:`, err)
    );
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// WRITE ASYNC - Enviar datos al Backend
// ──────────────────────────────────────────────────────────────────────────────
export async function writeAsync<T>(key: DBKey, value: T): Promise<void> {
  try {
    const endpoints: Record<DBKey, string> = {
      'dercas.usuarios': '/users',
      'dercas.productos': '/productos',
      'dercas.acuerdos': '/acuerdos',
      'dercas.mensajes': '/mensajes',
      'dercas.calificaciones': '/calificaciones',
      'dercas.notificaciones': '/notificaciones',
      'dercas.auditoria': '/auditoria',
      'dercas.codigosSMS': '/codigos',
      'dercas.sesion': '/sesion',
      'dercas.seed.v2': '/seed',
    };

    const endpoint = endpoints[key];
    if (!endpoint) return;

    await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value)
    });
  } catch (error) {
    console.warn(`Error syncing ${key} to backend:`, error);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// REMOVE - Eliminar del cache local
// ──────────────────────────────────────────────────────────────────────────────
export function remove(key: DBKey): void {
  localStorage.removeItem(key);
}

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

export function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function uid(prefix = ''): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}${t}${r}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

// ──────────────────────────────────────────────────────────────────────────────
// SESIÓN LOCAL - Datos de usuario actual (siempre en localStorage local)
// ──────────────────────────────────────────────────────────────────────────────

export function readSesionLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`dercas.sesion.${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeSesionLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`dercas.sesion.${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing sesion ${key}:`, error);
  }
}

export function removeSesionLocal(key: string): void {
  try {
    localStorage.removeItem(`dercas.sesion.${key}`);
  } catch (error) {
    console.error(`Error removing sesion ${key}:`, error);
  }
}