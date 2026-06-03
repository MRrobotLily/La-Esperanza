/**
 * Tests de Acuerdos — Basados en casos de prueba TC-ACU-*
 * Archivo: tests/unit/acuerdosApi.test.ts
 */

import {
  listarAcuerdos,
  obtenerAcuerdo,
  crearAcuerdo,
  aceptarAcuerdo,
  rechazarAcuerdo,
  confirmarEntrega,
  cancelarAcuerdo,
} from '../../src/api/acuerdosApi';
import {
  crearProducto,
  obtenerProducto,
} from '../../src/api/productosApi';
import { registrarUsuario } from '../../src/api/authApi';

describe('📋 Acuerdos de Compra', () => {
  let comprador: any;
  let productor: any;
  let producto1: any;
  let producto2: any;

  beforeEach(async () => {
    localStorage.clear();

    // Crear usuarios
    comprador = await registrarUsuario({
      telefono: '+50234567890',
      dpi: '1111111111111',
      dpiFotoUrl: 'data:image/jpeg;base64,test',
      nombre: 'Comprador',
      apellido: 'Test',
      rol: 'comprador',
    });

    productor = await registrarUsuario({
      telefono: '+50287654321',
      dpi: '2222222222222',
      dpiFotoUrl: 'data:image/jpeg;base64,test',
      nombre: 'Productor',
      apellido: 'Test',
      rol: 'productor',
    });

    // Crear productos
    producto1 = await crearProducto(productor.id, {
      nombre: 'Tomate',
      categoria: 'Verduras',
      descripcion: 'Tomate fresco',
      precioUnitario: 15,
      precioMayor: 12,
      cantidadMayor: 10,
      cantidadDisponible: 100,
      unidadMedida: 'lb',
      imagenes: ['img1.jpg'],
      tiposEntrega: ['local', 'envio'],
    });

    producto2 = await crearProducto(productor.id, {
      nombre: 'Lechuga',
      categoria: 'Verduras',
      descripcion: 'Lechuga fresca',
      precioUnitario: 8,
      precioMayor: 6,
      cantidadMayor: 20,
      cantidadDisponible: 200,
      unidadMedida: 'unidad',
      imagenes: ['img2.jpg'],
      tiposEntrega: ['local'],
    });
  });

  // =========================================================================
  // TC-ACU-001: Crear acuerdo exitosamente
  // =========================================================================
  describe('TC-ACU-001: Crear acuerdo', () => {
    test('debe crear acuerdo con estado pendiente', async () => {
      // Act
      const acuerdo = await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [
          { productoId: producto1.id, cantidad: 5 },
          { productoId: producto2.id, cantidad: 10 },
        ],
        canalContacto: 'whatsapp',
      });

      // Assert
      expect(acuerdo.id).toBeDefined();
      expect(acuerdo.estado).toBe('pendiente');
      expect(acuerdo.confirmadoComprador).toBe(false);
      expect(acuerdo.confirmadoProductor).toBe(false);
      expect(acuerdo.items.length).toBe(2);
    });

    test('debe calcular total correctamente con precio unitario', async () => {
      // Act
      const acuerdo = await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }], // 5 < 10 (cantidad mayor)
        canalContacto: 'whatsapp',
      });

      // Assert - Debe usar precioUnitario (15) no precioMayor
      expect(acuerdo.total).toBe(75); // 5 * 15
    });

    test('debe calcular total con precio mayor si cantidad >= cantidadMayor', async () => {
      // Act
      const acuerdo = await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [
          { productoId: producto1.id, cantidad: 10 }, // 10 >= 10 (cantidad mayor)
        ],
        canalContacto: 'whatsapp',
      });

      // Assert - Debe usar precioMayor (12)
      expect(acuerdo.total).toBe(120); // 10 * 12
    });
  });

  // =========================================================================
  // TC-ACU-002: Productor acepta acuerdo
  // =========================================================================
  describe('TC-ACU-002: Aceptar acuerdo', () => {
    test('debe cambiar estado a aceptado', async () => {
      // Arrange
      const acuerdo = await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }],
        canalContacto: 'whatsapp',
      });

      // Act
      const aceptado = await aceptarAcuerdo(acuerdo.id, {
        tipo: 'local',
        punto: 'Tienda Centro Comercial La Aurora',
        fecha: '2026-05-25',
      });

      // Assert
      expect(aceptado.estado).toBe('aceptado');
      expect(aceptado.entrega?.punto).toBe('Tienda Centro Comercial La Aurora');
      expect(aceptado.entrega?.fecha).toBe('2026-05-25');
    });
  });

  // =========================================================================
  // TC-ACU-003: Productor rechaza acuerdo
  // =========================================================================
  describe('TC-ACU-003: Rechazar acuerdo', () => {
    test('debe cambiar estado a rechazado', async () => {
      // Arrange
      const acuerdo = await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }],
        canalContacto: 'whatsapp',
      });

      // Act
      const rechazado = await rechazarAcuerdo(
        acuerdo.id,
        'No tengo suficiente stock disponible'
      );

      // Assert
      expect(rechazado.estado).toBe('rechazado');
      expect(rechazado.motivoRechazo).toBe(
        'No tengo suficiente stock disponible'
      );
    });
  });

  // =========================================================================
  // TC-ACU-004: Confirmar entrega por ambas partes
  // =========================================================================
  describe('TC-ACU-004: Confirmar entrega', () => {
    test('debe pasar a entregado cuando productor confirma', async () => {
      // Arrange
      const acuerdo = await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }],
        canalContacto: 'whatsapp',
      });

      await aceptarAcuerdo(acuerdo.id, {
        tipo: 'local',
        punto: 'Tienda',
        fecha: '2026-05-25',
      });

      // Act
      const confirmado = await confirmarEntrega(acuerdo.id, 'productor');

      // Assert
      expect(confirmado.confirmadoProductor).toBe(true);
      expect(confirmado.estado).toBe('entregado');
    });

    test('debe finalizar cuando ambas partes confirman', async () => {
      // Arrange
      const acuerdo = await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }],
        canalContacto: 'whatsapp',
      });

      await aceptarAcuerdo(acuerdo.id, {
        tipo: 'local',
        punto: 'Tienda',
        fecha: '2026-05-25',
      });

      // Act - Productor confirma
      const paso1 = await confirmarEntrega(acuerdo.id, 'productor');
      expect(paso1.confirmadoProductor).toBe(true);

      // Act - Comprador confirma
      const paso2 = await confirmarEntrega(acuerdo.id, 'comprador');

      // Assert
      expect(paso2.confirmadoComprador).toBe(true);
      expect(paso2.confirmadoProductor).toBe(true);
      expect(paso2.estado).toBe('finalizado');
    });

    test('debe descontar stock al finalizar', async () => {
      // Arrange
      const stockAntes = (await obtenerProducto(producto1.id))
        ?.cantidadDisponible;

      const acuerdo = await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }],
        canalContacto: 'whatsapp',
      });

      await aceptarAcuerdo(acuerdo.id, {
        tipo: 'local',
        punto: 'Tienda',
        fecha: '2026-05-25',
      });

      // Act
      await confirmarEntrega(acuerdo.id, 'productor');
      await confirmarEntrega(acuerdo.id, 'comprador');

      // Assert
      const stockDespues = (await obtenerProducto(producto1.id))
        ?.cantidadDisponible;
      expect(stockDespues).toBe((stockAntes || 0) - 5);
    });
  });

  // =========================================================================
  // Filtrar acuerdos por rol
  // =========================================================================
  describe('Filtrar acuerdos por rol', () => {
    test('comprador ve solo sus acuerdos', async () => {
      // Arrange
      await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }],
        canalContacto: 'whatsapp',
      });

      // Act
      const misAcuerdos = await listarAcuerdos(comprador.id, 'comprador');

      // Assert
      expect(misAcuerdos.length).toBe(1);
      expect(misAcuerdos[0].compradorId).toBe(comprador.id);
    });

    test('productor ve solo sus acuerdos', async () => {
      // Arrange
      await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }],
        canalContacto: 'whatsapp',
      });

      // Act
      const misAcuerdos = await listarAcuerdos(productor.id, 'productor');

      // Assert
      expect(misAcuerdos.length).toBe(1);
      expect(misAcuerdos[0].productorId).toBe(productor.id);
    });

    test('comité ve todos los acuerdos', async () => {
      // Arrange
      await crearAcuerdo({
        compradorId: comprador.id,
        productorId: productor.id,
        items: [{ productoId: producto1.id, cantidad: 5 }],
        canalContacto: 'whatsapp',
      });

      // Act
      const todosAcuerdos = await listarAcuerdos('cualquier-id', 'comite');

      // Assert
      expect(todosAcuerdos.length).toBe(1);
    });
  });
});
