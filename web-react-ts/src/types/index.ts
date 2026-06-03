// ──────────────────────────────────────────────────────────────────────────────
// Tipos de dominio — compartidos en toda la app
// ──────────────────────────────────────────────────────────────────────────────

export type Rol = 'productor' | 'comprador' | 'comite';

export type EstadoCuenta = 'activa' | 'suspendida' | 'cancelada';

export interface Usuario {
  id: string;
  telefono: string;          // +502XXXXXXXX
  dpi: string;               // 13 dígitos (único)
  dpiFotoUrl?: string;       // dataURL de la foto simulada
  nombre: string;
  apellido: string;
  direccion?: string;
  departamento?: string;
  municipio?: string;
  fotoPerfil?: string;       // dataURL
  rol: Rol;
  estado: EstadoCuenta;
  motivoSuspension?: string;
  suspendidoHasta?: string;  // ISO date — null para cancelación permanente
  creadoEn: string;
  actualizadoEn: string;
}

export type Categoria =
  | 'Hortalizas'
  | 'Granos Básicos'
  | 'Frutas'
  | 'Tubérculos'
  | 'Hierbas'
  | 'Lácteos';

export type UnidadMedida = 'lb' | 'kg' | 'quintal' | 'manojo' | 'unidad' | 'docena';

export type TipoEntrega = 'recoger' | 'delivery';

export interface Producto {
  id: string;
  productorId: string;
  nombre: string;
  categoria: Categoria;
  descripcion: string;
  precioUnitario: number;
  precioMayor: number;
  cantidadMayor: number;     // cantidad mínima para aplicar precio por mayor
  cantidadDisponible: number;
  unidadMedida: UnidadMedida;
  imagenes: string[];        // dataURLs (mín 1, máx 5)
  activo: boolean;
  tiposEntrega: TipoEntrega[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface ItemCarrito {
  productoId: string;
  cantidad: number;
}

export type EstadoAcuerdo =
  | 'pendiente'
  | 'aceptado'
  | 'rechazado'
  | 'entregado'
  | 'finalizado'
  | 'cancelado';

export interface Acuerdo {
  id: string;
  compradorId: string;
  productorId: string;
  items: {
    productoId: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  total: number;
  estado: EstadoAcuerdo;
  motivoRechazo?: string;
  entrega?: {
    tipo: TipoEntrega;
    punto: string;
    fecha: string;   // ISO
  };
  confirmadoComprador: boolean;
  confirmadoProductor: boolean;
  canalContacto: 'chat' | 'whatsapp';
  creadoEn: string;
  actualizadoEn: string;
}

export interface Mensaje {
  id: string;
  conversacionId: string;    // `${userAId}:${userBId}` ordenado
  remitenteId: string;
  destinatarioId: string;
  acuerdoId?: string;
  texto: string;
  leido: boolean;
  creadoEn: string;
}

export type DireccionCalificacion = 'comprador_a_productor' | 'productor_a_comprador';

export interface Calificacion {
  id: string;
  acuerdoId: string;
  compradorId: string;
  productorId: string;
  productoId?: string;                // sólo aplica cuando se califica al productor por un producto
  autorId: string;                    // quién emite la calificación
  destinatarioId: string;             // quién la recibe
  direccion: DireccionCalificacion;
  estrellas: number;                  // 1-5
  resena?: string;
  creadoEn: string;
}

export type TipoNotificacion =
  | 'solicitud_compra'
  | 'acuerdo_aceptado'
  | 'acuerdo_rechazado'
  | 'acuerdo_finalizado'
  | 'mensaje_nuevo'
  | 'calificacion'
  | 'advertencia_comite'
  | 'suspension_cuenta'
  | 'cancelacion_cuenta';

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  rutaDestino?: string;
  creadoEn: string;
}

export type TipoAuditoria =
  | 'advertencia'
  | 'suspension_temporal'
  | 'cancelacion_permanente'
  | 'observacion'
  | 'reactivacion';

export interface RegistroAuditoria {
  id: string;
  comiteId: string;
  usuarioAfectadoId: string;
  tipo: TipoAuditoria;
  motivo: string;
  duracionDias?: number;
  creadoEn: string;
}

export interface CodigoSMS {
  telefono: string;
  codigo: string;
  intentos: number;
  bloqueadoHasta?: string;   // ISO
  creadoEn: string;
}
