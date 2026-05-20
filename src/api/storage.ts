// ──────────────────────────────────────────────────────────────────────────────
// Capa de persistencia sobre localStorage.
// Simulamos latencia para que la app se comporte como si hubiera API real.
// Cuando migremos a backend, solo cambiamos los módulos en api/ — los hooks y
// screens no se tocan (Repository Pattern).
// ──────────────────────────────────────────────────────────────────────────────

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

export function read<T>(key: DBKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function write<T>(key: DBKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key: DBKey): void {
  localStorage.removeItem(key);
}

/** Simula latencia de red para que la UI tenga loading states reales. */
export function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** ID corto y único (suficiente para un prototipo). */
export function uid(prefix = ''): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}${t}${r}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
