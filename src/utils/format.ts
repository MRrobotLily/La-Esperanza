// ──────────────────────────────────────────────────────────────────────────────
// Utilidades puras de formato — reutilizables en toda la app.
// ──────────────────────────────────────────────────────────────────────────────

export function fmtQuetzales(valor: number): string {
  return `Q${valor.toFixed(2)}`;
}

export function fmtFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtFechaHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-GT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtTelefono(telefono: string): string {
  // Soporta "+50212345678" o "12345678" → "+502 1234 5678"
  const limpio = telefono.replace(/\D/g, '');
  const normalizado = limpio.length === 8 ? `502${limpio}` : limpio;
  const pais = normalizado.slice(0, 3);
  const a = normalizado.slice(3, 7);
  const b = normalizado.slice(7, 11);
  return `+${pais} ${a} ${b}`.trim();
}

export function iniciales(nombre: string, apellido?: string): string {
  const a = nombre?.[0] ?? '';
  const b = apellido?.[0] ?? '';
  return (a + b).toUpperCase();
}

export function emojiCategoria(cat: string): string {
  const map: Record<string, string> = {
    Hortalizas: '🥬',
    'Granos Básicos': '🌾',
    Frutas: '🍎',
    Tubérculos: '🥔',
    Hierbas: '🌿',
    Lácteos: '🥛',
  };
  return map[cat] ?? '🌱';
}

export function etiquetaRol(rol: string): string {
  const map: Record<string, string> = {
    productor: 'Productor',
    comprador: 'Comprador',
    comite: 'Comité',
  };
  return map[rol] ?? rol;
}

export function estadoAcuerdoLabel(estado: string): string {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    aceptado: 'Aceptado',
    rechazado: 'Rechazado',
    entregado: 'En entrega',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  };
  return map[estado] ?? estado;
}
