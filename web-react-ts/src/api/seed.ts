// ──────────────────────────────────────────────────────────────────────────────
// Semilla de datos para un prototipo navegable.
// Solo corre una vez por navegador (clave `seed.v1`).
// Incluye usuarios, productos, acuerdos en TODOS los estados, conversaciones
// y calificaciones bidireccionales para que la app se vea "viva" desde login.
// ──────────────────────────────────────────────────────────────────────────────

import type {
  Acuerdo,
  Calificacion,
  Mensaje,
  Notificacion,
  Producto,
  RegistroAuditoria,
  Usuario,
} from '../types';
import { DB_KEYS, read, uid, write } from './storage';

const imagenesDemo: Record<string, string> = {
  tomate: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop',
  maiz: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
  frijol: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop',
  chile: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=300&fit=crop',
  aguacate: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop',
  platano: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
  cebolla: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
  zanahoria: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
  limon: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=300&fit=crop',
  repollo: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=300&fit=crop',
};

// Utilitario para obtener una fecha ISO desplazada n días desde hoy.
function hace(dias: number, horas = 0, minutos = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(d.getHours() - horas);
  d.setMinutes(d.getMinutes() - minutos);
  return d.toISOString();
}

// Fecha futura (para entregas programadas).
function dentroDe(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString();
}

function idConv(a: string, b: string): string {
  return [a, b].sort().join(':');
}

export function seedDatabase(): void {
  if (read(DB_KEYS.seed, null)) return;

  // Si existían datos de una semilla anterior (v1), los limpiamos para evitar
  // registros huérfanos (acuerdos / mensajes viejos que ya no corresponden).
  const legacyV1Key = 'dercas.seed.v1';
  if (localStorage.getItem(legacyV1Key)) {
    localStorage.removeItem(DB_KEYS.usuarios);
    localStorage.removeItem(DB_KEYS.productos);
    localStorage.removeItem(DB_KEYS.acuerdos);
    localStorage.removeItem(DB_KEYS.mensajes);
    localStorage.removeItem(DB_KEYS.calificaciones);
    localStorage.removeItem(DB_KEYS.notificaciones);
    localStorage.removeItem(DB_KEYS.auditoria);
    localStorage.removeItem(legacyV1Key);
  }

  const ahora = new Date().toISOString();

  // ────────────────────────────────────────────────────────────
  // Usuarios — 2 productores, 2 compradores y 1 comité
  // ────────────────────────────────────────────────────────────
  const usuarios: Usuario[] = [
    {
      id: uid('u_'),
      telefono: '+50255500001',
      dpi: '1234567890101',
      nombre: 'Juan',
      apellido: 'Pérez',
      direccion: 'Aldea La Esperanza',
      departamento: 'Quetzaltenango',
      municipio: 'Concepción Chiquirichapa',
      rol: 'productor',
      estado: 'activa',
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('u_'),
      telefono: '+50255500002',
      dpi: '2234567890101',
      nombre: 'María',
      apellido: 'López',
      direccion: 'Cantón El Rosario',
      departamento: 'Quetzaltenango',
      municipio: 'San Juan Ostuncalco',
      rol: 'productor',
      estado: 'activa',
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('u_'),
      telefono: '+50255500003',
      dpi: '3234567890101',
      nombre: 'Carlos',
      apellido: 'Gómez',
      direccion: 'Zona 3',
      departamento: 'Quetzaltenango',
      municipio: 'Quetzaltenango',
      rol: 'comprador',
      estado: 'activa',
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('u_'),
      telefono: '+50255500004',
      dpi: '4234567890101',
      nombre: 'Ana',
      apellido: 'Martínez',
      direccion: 'Zona 1',
      departamento: 'Quetzaltenango',
      municipio: 'Quetzaltenango',
      rol: 'comite',
      estado: 'activa',
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('u_'),
      telefono: '+50255500005',
      dpi: '5234567890101',
      nombre: 'Luis',
      apellido: 'Hernández',
      direccion: 'Colonia Molina',
      departamento: 'Quetzaltenango',
      municipio: 'Quetzaltenango',
      rol: 'comprador',
      estado: 'activa',
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
  ];

  const [juan, maria, carlos, ana, luis] = usuarios;

  // ────────────────────────────────────────────────────────────
  // Productos
  // ────────────────────────────────────────────────────────────
  const productos: Producto[] = [
    {
      id: uid('p_'),
      productorId: juan.id,
      nombre: 'Tomate de Cosecha',
      categoria: 'Hortalizas',
      descripcion: 'Tomate fresco cosechado en altura. Cosecha de la semana.',
      precioUnitario: 5.0,
      precioMayor: 4.25,
      cantidadMayor: 25,
      cantidadDisponible: 200,
      unidadMedida: 'lb',
      imagenes: [imagenesDemo.tomate],
      activo: true,
      tiposEntrega: ['recoger', 'delivery'],
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('p_'),
      productorId: juan.id,
      nombre: 'Chile Pimiento Verde',
      categoria: 'Hortalizas',
      descripcion: 'Chile pimiento firme y brilloso, ideal para mercado.',
      precioUnitario: 8.0,
      precioMayor: 6.5,
      cantidadMayor: 30,
      cantidadDisponible: 80,
      unidadMedida: 'lb',
      imagenes: [imagenesDemo.chile],
      activo: true,
      tiposEntrega: ['recoger'],
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('p_'),
      productorId: maria.id,
      nombre: 'Maíz Blanco',
      categoria: 'Granos Básicos',
      descripcion: 'Maíz blanco criollo, grano limpio y seco.',
      precioUnitario: 150.0,
      precioMayor: 135.0,
      cantidadMayor: 5,
      cantidadDisponible: 15,
      unidadMedida: 'quintal',
      imagenes: [imagenesDemo.maiz],
      activo: true,
      tiposEntrega: ['recoger', 'delivery'],
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('p_'),
      productorId: maria.id,
      nombre: 'Frijol Negro',
      categoria: 'Granos Básicos',
      descripcion: 'Frijol negro limpio, cosecha reciente.',
      precioUnitario: 180.0,
      precioMayor: 165.0,
      cantidadMayor: 3,
      cantidadDisponible: 10,
      unidadMedida: 'quintal',
      imagenes: [imagenesDemo.frijol],
      activo: true,
      tiposEntrega: ['recoger'],
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('p_'),
      productorId: juan.id,
      nombre: 'Aguacate Hass',
      categoria: 'Frutas',
      descripcion: 'Aguacate tipo Hass maduro al punto.',
      precioUnitario: 12.0,
      precioMayor: 10.0,
      cantidadMayor: 20,
      cantidadDisponible: 150,
      unidadMedida: 'lb',
      imagenes: [imagenesDemo.aguacate],
      activo: true,
      tiposEntrega: ['recoger', 'delivery'],
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('p_'),
      productorId: maria.id,
      nombre: 'Zanahoria',
      categoria: 'Tubérculos',
      descripcion: 'Zanahoria dulce y firme, lavada.',
      precioUnitario: 3.5,
      precioMayor: 3.0,
      cantidadMayor: 30,
      cantidadDisponible: 90,
      unidadMedida: 'lb',
      imagenes: [imagenesDemo.zanahoria],
      activo: true,
      tiposEntrega: ['recoger', 'delivery'],
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('p_'),
      productorId: juan.id,
      nombre: 'Cebolla Blanca',
      categoria: 'Hortalizas',
      descripcion: 'Cebolla blanca limpia y seca.',
      precioUnitario: 4.5,
      precioMayor: 3.75,
      cantidadMayor: 25,
      cantidadDisponible: 120,
      unidadMedida: 'lb',
      imagenes: [imagenesDemo.cebolla],
      activo: true,
      tiposEntrega: ['recoger'],
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
    {
      id: uid('p_'),
      productorId: maria.id,
      nombre: 'Limón Persa',
      categoria: 'Frutas',
      descripcion: 'Limón jugoso y de piel delgada.',
      precioUnitario: 3.0,
      precioMayor: 2.5,
      cantidadMayor: 50,
      cantidadDisponible: 200,
      unidadMedida: 'lb',
      imagenes: [imagenesDemo.limon],
      activo: true,
      tiposEntrega: ['recoger', 'delivery'],
      creadoEn: ahora,
      actualizadoEn: ahora,
    },
  ];

  const [tomate, chile, maizB, frijol, aguacate, zanahoria, cebolla, limon] = productos;

  // ────────────────────────────────────────────────────────────
  // Acuerdos — uno por cada estado del flujo DA-03
  // ────────────────────────────────────────────────────────────
  const acuerdoPendiente: Acuerdo = {
    id: uid('ac_'),
    compradorId: carlos.id,
    productorId: juan.id,
    items: [
      {
        productoId: tomate.id,
        nombreProducto: tomate.nombre,
        cantidad: 30,
        precioUnitario: tomate.precioMayor,
        subtotal: 30 * tomate.precioMayor,
      },
      {
        productoId: chile.id,
        nombreProducto: chile.nombre,
        cantidad: 10,
        precioUnitario: chile.precioUnitario,
        subtotal: 10 * chile.precioUnitario,
      },
    ],
    total: 30 * tomate.precioMayor + 10 * chile.precioUnitario,
    estado: 'pendiente',
    confirmadoComprador: false,
    confirmadoProductor: false,
    canalContacto: 'chat',
    creadoEn: hace(0, 2),
    actualizadoEn: hace(0, 2),
  };

  const acuerdoAceptado: Acuerdo = {
    id: uid('ac_'),
    compradorId: carlos.id,
    productorId: maria.id,
    items: [
      {
        productoId: maizB.id,
        nombreProducto: maizB.nombre,
        cantidad: 6,
        precioUnitario: maizB.precioMayor,
        subtotal: 6 * maizB.precioMayor,
      },
    ],
    total: 6 * maizB.precioMayor,
    estado: 'aceptado',
    entrega: {
      tipo: 'delivery',
      punto: 'Mercado La Democracia, Quetzaltenango',
      fecha: dentroDe(2),
    },
    confirmadoComprador: false,
    confirmadoProductor: false,
    canalContacto: 'chat',
    creadoEn: hace(1),
    actualizadoEn: hace(0, 5),
  };

  const acuerdoEntregado: Acuerdo = {
    id: uid('ac_'),
    compradorId: luis.id,
    productorId: juan.id,
    items: [
      {
        productoId: aguacate.id,
        nombreProducto: aguacate.nombre,
        cantidad: 25,
        precioUnitario: aguacate.precioMayor,
        subtotal: 25 * aguacate.precioMayor,
      },
      {
        productoId: cebolla.id,
        nombreProducto: cebolla.nombre,
        cantidad: 15,
        precioUnitario: cebolla.precioUnitario,
        subtotal: 15 * cebolla.precioUnitario,
      },
    ],
    total: 25 * aguacate.precioMayor + 15 * cebolla.precioUnitario,
    estado: 'entregado',
    entrega: {
      tipo: 'recoger',
      punto: 'Finca Aldea La Esperanza',
      fecha: hace(0, 3),
    },
    confirmadoComprador: false,
    confirmadoProductor: true, // el productor ya confirmó, falta el comprador
    canalContacto: 'chat',
    creadoEn: hace(2),
    actualizadoEn: hace(0, 3),
  };

  const acuerdoFinalizado: Acuerdo = {
    id: uid('ac_'),
    compradorId: carlos.id,
    productorId: juan.id,
    items: [
      {
        productoId: tomate.id,
        nombreProducto: tomate.nombre,
        cantidad: 40,
        precioUnitario: tomate.precioMayor,
        subtotal: 40 * tomate.precioMayor,
      },
    ],
    total: 40 * tomate.precioMayor,
    estado: 'finalizado',
    entrega: {
      tipo: 'delivery',
      punto: 'Mercado La Democracia, Quetzaltenango',
      fecha: hace(5),
    },
    confirmadoComprador: true,
    confirmadoProductor: true,
    canalContacto: 'chat',
    creadoEn: hace(10),
    actualizadoEn: hace(4),
  };

  const acuerdoRechazado: Acuerdo = {
    id: uid('ac_'),
    compradorId: luis.id,
    productorId: maria.id,
    items: [
      {
        productoId: frijol.id,
        nombreProducto: frijol.nombre,
        cantidad: 20,
        precioUnitario: frijol.precioMayor,
        subtotal: 20 * frijol.precioMayor,
      },
    ],
    total: 20 * frijol.precioMayor,
    estado: 'rechazado',
    motivoRechazo: 'No tengo esa cantidad disponible en este momento. Disculpe.',
    confirmadoComprador: false,
    confirmadoProductor: false,
    canalContacto: 'chat',
    creadoEn: hace(3),
    actualizadoEn: hace(2, 12),
  };

  const acuerdoCancelado: Acuerdo = {
    id: uid('ac_'),
    compradorId: carlos.id,
    productorId: maria.id,
    items: [
      {
        productoId: limon.id,
        nombreProducto: limon.nombre,
        cantidad: 60,
        precioUnitario: limon.precioMayor,
        subtotal: 60 * limon.precioMayor,
      },
      {
        productoId: zanahoria.id,
        nombreProducto: zanahoria.nombre,
        cantidad: 30,
        precioUnitario: zanahoria.precioMayor,
        subtotal: 30 * zanahoria.precioMayor,
      },
    ],
    total: 60 * limon.precioMayor + 30 * zanahoria.precioMayor,
    estado: 'cancelado',
    motivoRechazo: 'El comprador canceló porque consiguió el producto con otro proveedor.',
    confirmadoComprador: false,
    confirmadoProductor: false,
    canalContacto: 'chat',
    creadoEn: hace(6),
    actualizadoEn: hace(5),
  };

  const acuerdos: Acuerdo[] = [
    acuerdoPendiente,
    acuerdoAceptado,
    acuerdoEntregado,
    acuerdoFinalizado,
    acuerdoRechazado,
    acuerdoCancelado,
  ];

  // ────────────────────────────────────────────────────────────
  // Mensajes — conversaciones entre compradores y productores
  // ────────────────────────────────────────────────────────────
  const mensajes: Mensaje[] = [
    // Conversación Carlos ↔ Juan (sobre acuerdo pendiente + histórico)
    {
      id: uid('m_'),
      conversacionId: idConv(carlos.id, juan.id),
      remitenteId: carlos.id,
      destinatarioId: juan.id,
      acuerdoId: acuerdoFinalizado.id,
      texto: 'Don Juan, llegó bien el tomate, muchas gracias!',
      leido: true,
      creadoEn: hace(4),
    },
    {
      id: uid('m_'),
      conversacionId: idConv(carlos.id, juan.id),
      remitenteId: juan.id,
      destinatarioId: carlos.id,
      acuerdoId: acuerdoFinalizado.id,
      texto: 'Un gusto servirle, don Carlos. Cuando necesite más, me avisa.',
      leido: true,
      creadoEn: hace(3, 20),
    },
    {
      id: uid('m_'),
      conversacionId: idConv(carlos.id, juan.id),
      remitenteId: carlos.id,
      destinatarioId: juan.id,
      acuerdoId: acuerdoPendiente.id,
      texto: 'Le envié una nueva solicitud por 30 lb de tomate y 10 lb de chile.',
      leido: true,
      creadoEn: hace(0, 2),
    },
    {
      id: uid('m_'),
      conversacionId: idConv(carlos.id, juan.id),
      remitenteId: juan.id,
      destinatarioId: carlos.id,
      acuerdoId: acuerdoPendiente.id,
      texto: 'Perfecto, lo reviso en un momento y le confirmo.',
      leido: false, // Carlos aún no lo leyó
      creadoEn: hace(0, 1, 30),
    },

    // Conversación Carlos ↔ María (acuerdo aceptado)
    {
      id: uid('m_'),
      conversacionId: idConv(carlos.id, maria.id),
      remitenteId: carlos.id,
      destinatarioId: maria.id,
      acuerdoId: acuerdoAceptado.id,
      texto: 'Doña María, necesito 6 quintales de maíz blanco para el fin de semana.',
      leido: true,
      creadoEn: hace(1, 2),
    },
    {
      id: uid('m_'),
      conversacionId: idConv(carlos.id, maria.id),
      remitenteId: maria.id,
      destinatarioId: carlos.id,
      acuerdoId: acuerdoAceptado.id,
      texto: 'Sí, don Carlos, tengo disponible. Le acepto el acuerdo. ¿Delivery en el mercado?',
      leido: true,
      creadoEn: hace(1, 1),
    },
    {
      id: uid('m_'),
      conversacionId: idConv(carlos.id, maria.id),
      remitenteId: carlos.id,
      destinatarioId: maria.id,
      acuerdoId: acuerdoAceptado.id,
      texto: 'Perfecto, entonces el miércoles en La Democracia. Muchas gracias.',
      leido: false,
      creadoEn: hace(0, 5),
    },

    // Conversación Luis ↔ Juan (acuerdo entregado)
    {
      id: uid('m_'),
      conversacionId: idConv(luis.id, juan.id),
      remitenteId: luis.id,
      destinatarioId: juan.id,
      acuerdoId: acuerdoEntregado.id,
      texto: 'Don Juan, paso hoy por el aguacate y la cebolla.',
      leido: true,
      creadoEn: hace(0, 6),
    },
    {
      id: uid('m_'),
      conversacionId: idConv(luis.id, juan.id),
      remitenteId: juan.id,
      destinatarioId: luis.id,
      acuerdoId: acuerdoEntregado.id,
      texto: 'Perfecto, aquí lo espero. Ya confirmé la entrega en la app.',
      leido: true,
      creadoEn: hace(0, 3, 15),
    },
    {
      id: uid('m_'),
      conversacionId: idConv(luis.id, juan.id),
      remitenteId: juan.id,
      destinatarioId: luis.id,
      texto: 'Recuerde confirmar usted también cuando reciba el producto.',
      leido: false,
      creadoEn: hace(0, 3),
    },
  ];

  // ────────────────────────────────────────────────────────────
  // Calificaciones — bidireccionales sobre el acuerdo finalizado
  // ────────────────────────────────────────────────────────────
  const calificaciones: Calificacion[] = [
    // Carlos calificó a Juan
    {
      id: uid('c_'),
      acuerdoId: acuerdoFinalizado.id,
      compradorId: carlos.id,
      productorId: juan.id,
      productoId: tomate.id,
      autorId: carlos.id,
      destinatarioId: juan.id,
      direccion: 'comprador_a_productor',
      estrellas: 5,
      resena: 'Tomate muy fresco. Puntual en la entrega. Excelente trato.',
      creadoEn: hace(4, 2),
    },
    // Juan calificó a Carlos
    {
      id: uid('c_'),
      acuerdoId: acuerdoFinalizado.id,
      compradorId: carlos.id,
      productorId: juan.id,
      autorId: juan.id,
      destinatarioId: carlos.id,
      direccion: 'productor_a_comprador',
      estrellas: 5,
      resena: 'Cliente serio y puntual con el pago. Bienvenido otra vez.',
      creadoEn: hace(4, 1),
    },
    // Carlos (histórico) sobre maíz de María — sin acuerdo específico en el seed
    {
      id: uid('c_'),
      acuerdoId: 'hist_' + uid(''),
      compradorId: carlos.id,
      productorId: maria.id,
      productoId: maizB.id,
      autorId: carlos.id,
      destinatarioId: maria.id,
      direccion: 'comprador_a_productor',
      estrellas: 4,
      resena: 'Buen maíz. La próxima volveré a comprar.',
      creadoEn: hace(20),
    },
    // Luis calificó a Juan (histórico)
    {
      id: uid('c_'),
      acuerdoId: 'hist_' + uid(''),
      compradorId: luis.id,
      productorId: juan.id,
      productoId: chile.id,
      autorId: luis.id,
      destinatarioId: juan.id,
      direccion: 'comprador_a_productor',
      estrellas: 5,
      resena: 'Producto de primera. Muy recomendado.',
      creadoEn: hace(30),
    },
  ];

  // ────────────────────────────────────────────────────────────
  // Notificaciones recientes (una por usuario al iniciar)
  // ────────────────────────────────────────────────────────────
  const notificaciones: Notificacion[] = [
    {
      id: uid('n_'),
      usuarioId: juan.id,
      tipo: 'solicitud_compra',
      titulo: 'Nueva solicitud de compra',
      mensaje: 'Carlos Gómez envió una solicitud por Q' +
        acuerdoPendiente.total.toFixed(2) + '.',
      leida: false,
      rutaDestino: `/acuerdos/${acuerdoPendiente.id}`,
      creadoEn: acuerdoPendiente.creadoEn,
    },
    {
      id: uid('n_'),
      usuarioId: carlos.id,
      tipo: 'acuerdo_aceptado',
      titulo: 'Solicitud aceptada',
      mensaje: 'María López aceptó tu solicitud de maíz blanco.',
      leida: false,
      rutaDestino: `/acuerdos/${acuerdoAceptado.id}`,
      creadoEn: acuerdoAceptado.actualizadoEn,
    },
    {
      id: uid('n_'),
      usuarioId: luis.id,
      tipo: 'mensaje_nuevo',
      titulo: 'Nuevo mensaje',
      mensaje: 'Recuerde confirmar usted también cuando reciba el producto.',
      leida: false,
      rutaDestino: `/chat/${juan.id}`,
      creadoEn: hace(0, 3),
    },
  ];

  // ────────────────────────────────────────────────────────────
  // Auditoría del comité — una observación de ejemplo
  // ────────────────────────────────────────────────────────────
  const auditoria: RegistroAuditoria[] = [
    {
      id: uid('a_'),
      comiteId: ana.id,
      usuarioAfectadoId: luis.id,
      tipo: 'observacion',
      motivo: 'Se revisa acuerdo rechazado #' + acuerdoRechazado.id + ' a modo informativo.',
      creadoEn: hace(1),
    },
  ];

  // ────────────────────────────────────────────────────────────
  // Persistimos todo
  // ────────────────────────────────────────────────────────────
  write(DB_KEYS.usuarios, usuarios);
  write(DB_KEYS.productos, productos);
  write(DB_KEYS.acuerdos, acuerdos);
  write(DB_KEYS.mensajes, mensajes);
  write(DB_KEYS.calificaciones, calificaciones);
  write(DB_KEYS.notificaciones, notificaciones);
  write(DB_KEYS.auditoria, auditoria);
  write(DB_KEYS.seed, { version: 2, creadoEn: ahora });
}
