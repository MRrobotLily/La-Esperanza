/**
 * Tests de Carrito — Basados en casos de prueba TC-CARR-*
 * Archivo: tests/unit/carritoApi.test.ts
 */

import {
  leerCarrito,
  guardarCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  leerCarritoHidratado,
} from '../../src/api/carritoApi';
import { crearProducto } from '../../src/api/productosApi';
import { registrarUsuario } from '../../src/api/authApi';

describe('🛒 Carrito de Compras', () => {
  const usuarioId = 'usuario_test_1';
  let productor: any;
  let producto1: any;
  let producto2: any;

  beforeEach(async () => {
    localStorage.clear();

    productor = await registrarUsuario({
      telefono: '+50234567890',
      dpi: '1111111111111',
      dpiFotoUrl: 'data:image/jpeg;base64,test',
      nombre: 'Productor',
      apellido: 'Test',
      rol: 'productor',
    });

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
      tiposEntrega: ['local'],
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
  // TC-CARR-001: Agregar producto al carrito
  // =========================================================================
  describe('TC-CARR-001: Agregar producto', () => {
    test('debe retornar array vacío inicialmente', async () => {
      // Act
      const items = await leerCarrito(usuarioId);

      // Assert
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    test('debe agregar producto al carrito', async () => {
      // Act
      const items = await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Assert
      expect(items.length).toBe(1);
      expect(items[0].productoId).toBe(producto1.id);
      expect(items[0].cantidad).toBe(5);
    });

    test('debe guardar en localStorage', async () => {
      // Act
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Assert
      const guardado = JSON.parse(
        localStorage.getItem(`dercas.carrito.${usuarioId}`) || '[]'
      );
      expect(guardado.length).toBe(1);
    });
  });

  // =========================================================================
  // TC-CARR-002: Incrementar cantidad de producto
  // =========================================================================
  describe('TC-CARR-002: Incrementar cantidad', () => {
    test('debe incrementar cantidad si producto ya existe', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Act
      const items = await agregarAlCarrito(usuarioId, producto1.id, 3);

      // Assert
      expect(items.length).toBe(1); // No duplica, solo incrementa
      expect(items[0].cantidad).toBe(8); // 5 + 3
    });

    test('debe acumular múltiples adiciones', async () => {
      // Act
      await agregarAlCarrito(usuarioId, producto1.id, 5);
      await agregarAlCarrito(usuarioId, producto1.id, 3);
      const items = await agregarAlCarrito(usuarioId, producto1.id, 2);

      // Assert
      expect(items[0].cantidad).toBe(10); // 5 + 3 + 2
    });
  });

  // =========================================================================
  // TC-CARR-003: Actualizar cantidad manualmente
  // =========================================================================
  describe('TC-CARR-003: Actualizar cantidad', () => {
    test('debe actualizar cantidad de producto existente', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Act
      const items = await actualizarCantidad(usuarioId, producto1.id, 10);

      // Assert
      expect(items.length).toBe(1);
      expect(items[0].cantidad).toBe(10);
    });

    test('debe retornar items sin cambios si producto no existe', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Act
      const items = await actualizarCantidad(usuarioId, 'prod_inexistente', 10);

      // Assert
      expect(items.length).toBe(1); // Solo producto1
      expect(items[0].productoId).toBe(producto1.id);
    });

    test('debe eliminar si cantidad es 0', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);
      await agregarAlCarrito(usuarioId, producto2.id, 3);

      // Act
      const items = await actualizarCantidad(usuarioId, producto1.id, 0);

      // Assert
      expect(items.length).toBe(1);
      expect(items[0].productoId).toBe(producto2.id);
    });

    test('debe eliminar si cantidad es negativa', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Act
      const items = await actualizarCantidad(usuarioId, producto1.id, -1);

      // Assert
      expect(items.length).toBe(0);
    });
  });

  // =========================================================================
  // TC-CARR-004: Eliminar producto del carrito
  // =========================================================================
  describe('TC-CARR-004: Eliminar producto', () => {
    test('debe eliminar solo ese producto', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);
      await agregarAlCarrito(usuarioId, producto2.id, 3);

      // Act
      const items = await eliminarDelCarrito(usuarioId, producto1.id);

      // Assert
      expect(items.length).toBe(1);
      expect(items[0].productoId).toBe(producto2.id);
    });

    test('debe manejar eliminación de producto inexistente', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Act
      const items = await eliminarDelCarrito(usuarioId, 'prod_inexistente');

      // Assert
      expect(items.length).toBe(1); // Sin cambios
      expect(items[0].productoId).toBe(producto1.id);
    });
  });

  // =========================================================================
  // TC-CARR-005: Vaciar carrito completo
  // =========================================================================
  describe('TC-CARR-005: Vaciar carrito', () => {
    test('debe vaciar todos los items', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);
      await agregarAlCarrito(usuarioId, producto2.id, 3);

      // Act
      await vaciarCarrito(usuarioId);
      const items = await leerCarrito(usuarioId);

      // Assert
      expect(items.length).toBe(0);
    });

    test('debe limpiar localStorage', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Act
      await vaciarCarrito(usuarioId);

      // Assert
      const guardado = localStorage.getItem(`dercas.carrito.${usuarioId}`);
      expect(guardado).toBeNull();
    });
  });

  // =========================================================================
  // Carrito hidratado (con datos de productos)
  // =========================================================================
  describe('Carrito hidratado', () => {
    test('debe enriquecer items con datos de producto', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Act
      const hidratados = await leerCarritoHidratado(usuarioId);

      // Assert
      expect(hidratados.length).toBe(1);
      expect(hidratados[0].producto).toBeDefined();
      expect(hidratados[0].producto.nombre).toBe('Tomate');
      expect(hidratados[0].producto.precioUnitario).toBe(15);
    });

    test('debe calcular precio aplicado correctamente', async () => {
      // Arrange - Cantidad menor a cantidad mayor
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Act
      const hidratados = await leerCarritoHidratado(usuarioId);

      // Assert - Debe usar precioUnitario (15)
      expect(hidratados[0].precioAplicado).toBe(15);
      expect(hidratados[0].subtotal).toBe(75); // 15 * 5
    });

    test('debe usar precioMayor si cantidad >= cantidadMayor', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 10);

      // Act
      const hidratados = await leerCarritoHidratado(usuarioId);

      // Assert
      expect(hidratados[0].precioAplicado).toBe(12); // precioMayor
      expect(hidratados[0].subtotal).toBe(120); // 12 * 10
    });

    test('debe indicar si supera stock', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 150); // Más que 100 disponibles

      // Act
      const hidratados = await leerCarritoHidratado(usuarioId);

      // Assert
      expect(hidratados[0].superaStock).toBe(true);
    });

    test('debe filtrar productos que no existen', async () => {
      // Arrange - Agregar producto y luego eliminarlo del catálogo
      await agregarAlCarrito(usuarioId, producto1.id, 5);

      // Simular que el producto no existe
      const items = await leerCarrito(usuarioId);
      items.push({ productoId: 'prod_eliminado', cantidad: 3 });
      await guardarCarrito(usuarioId, items);

      // Act
      const hidratados = await leerCarritoHidratado(usuarioId);

      // Assert - Solo el producto existente
      expect(hidratados.length).toBe(1);
      expect(hidratados[0].productoId).toBe(producto1.id);
    });

    test('debe calcular total del carrito', async () => {
      // Arrange
      await agregarAlCarrito(usuarioId, producto1.id, 5); // 5 * 15 = 75
      await agregarAlCarrito(usuarioId, producto2.id, 3); // 3 * 8 = 24

      // Act
      const hidratados = await leerCarritoHidratado(usuarioId);
      const total = hidratados.reduce((sum, item) => sum + item.subtotal, 0);

      // Assert
      expect(total).toBe(99); // 75 + 24
    });
  });
});
