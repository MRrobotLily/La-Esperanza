/**
 * Tests de Productos — Basados en casos de prueba TC-PROD-*
 * Archivo: tests/unit/productosApi.test.ts
 */

import {
  listarProductos,
  crearProducto,
  obtenerProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  eliminarProducto,
  descontarStock,
} from '../../src/api/productosApi';

describe('🛒 Productos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // TC-PROD-001: Listar productos activos
  // =========================================================================
  describe('TC-PROD-001: Listar productos activos', () => {
    test('debe retornar array vacío inicialmente', async () => {
      // Act
      const productos = await listarProductos({ soloActivos: true });

      // Assert
      expect(Array.isArray(productos)).toBe(true);
      expect(productos.length).toBe(0);
    });

    test('debe retornar solo productos activos', async () => {
      // Arrange
      const prod1 = await crearProducto('productor1', {
        nombre: 'Tomate',
        categoria: 'Verduras',
        descripcion: 'Tomate fresco',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img1.jpg'],
        tiposEntrega: ['local'],
      });

      // Crear producto inactivo
      const prod2 = await crearProducto('productor1', {
        nombre: 'Lechuga',
        categoria: 'Verduras',
        descripcion: 'Lechuga verde',
        precioUnitario: 5,
        precioMayor: 4,
        cantidadMayor: 10,
        cantidadDisponible: 50,
        unidadMedida: 'unidad',
        imagenes: ['img2.jpg'],
        tiposEntrega: ['local'],
      });

      await cambiarEstadoProducto(prod2.id, false);

      // Act
      const activos = await listarProductos({ soloActivos: true });

      // Assert
      expect(activos.length).toBe(1);
      expect(activos[0].id).toBe(prod1.id);
      expect(activos[0].activo).toBe(true);
    });

    test('debe ordenar por más recientes primero', async () => {
      // Arrange
      const prod1 = await crearProducto('productor1', {
        nombre: 'Producto1',
        categoria: 'Verduras',
        descripcion: 'Desc1',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img1.jpg'],
        tiposEntrega: ['local'],
      });

      const prod2 = await crearProducto('productor1', {
        nombre: 'Producto2',
        categoria: 'Frutas',
        descripcion: 'Desc2',
        precioUnitario: 15,
        precioMayor: 12,
        cantidadMayor: 5,
        cantidadDisponible: 80,
        unidadMedida: 'lb',
        imagenes: ['img2.jpg'],
        tiposEntrega: ['local'],
      });

      // Act
      const productos = await listarProductos();

      // Assert
      expect(productos[0].id).toBe(prod2.id); // Más reciente primero
      expect(productos[1].id).toBe(prod1.id);
    });
  });

  // =========================================================================
  // TC-PROD-002: Filtrar por categoría
  // =========================================================================
  describe('TC-PROD-002: Filtrar por categoría', () => {
    test('debe filtrar productos por categoría', async () => {
      // Arrange
      await crearProducto('prod1', {
        nombre: 'Tomate',
        categoria: 'Verduras',
        descripcion: 'Tomate',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img1.jpg'],
        tiposEntrega: ['local'],
      });

      await crearProducto('prod1', {
        nombre: 'Manzana',
        categoria: 'Frutas',
        descripcion: 'Manzana roja',
        precioUnitario: 12,
        precioMayor: 10,
        cantidadMayor: 5,
        cantidadDisponible: 50,
        unidadMedida: 'lb',
        imagenes: ['img2.jpg'],
        tiposEntrega: ['local'],
      });

      // Act
      const verduras = await listarProductos({ categoria: 'Verduras' });
      const frutas = await listarProductos({ categoria: 'Frutas' });

      // Assert
      expect(verduras.length).toBe(1);
      expect(frutas.length).toBe(1);
      expect(verduras[0].categoria).toBe('Verduras');
      expect(frutas[0].categoria).toBe('Frutas');
    });
  });

  // =========================================================================
  // TC-PROD-003: Buscar producto (case-insensitive)
  // =========================================================================
  describe('TC-PROD-003: Buscar producto', () => {
    test('debe buscar por nombre (case-insensitive)', async () => {
      // Arrange
      await crearProducto('prod1', {
        nombre: 'Tomate Orgánico',
        categoria: 'Verduras',
        descripcion: 'Tomate fresco de la huerta',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img.jpg'],
        tiposEntrega: ['local'],
      });

      // Act
      const resultado1 = await listarProductos({ busqueda: 'tomate' });
      const resultado2 = await listarProductos({ busqueda: 'TOMATE' });
      const resultado3 = await listarProductos({ busqueda: 'ToMaTe' });

      // Assert
      expect(resultado1.length).toBe(1);
      expect(resultado2.length).toBe(1);
      expect(resultado3.length).toBe(1);
    });

    test('debe buscar en nombre y descripción', async () => {
      // Arrange
      await crearProducto('prod1', {
        nombre: 'Verdura Roja',
        categoria: 'Verduras',
        descripcion: 'Tomate de excelente calidad',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img.jpg'],
        tiposEntrega: ['local'],
      });

      // Act - Buscar por palabra en descripción
      const resultado = await listarProductos({ busqueda: 'tomate' });

      // Assert
      expect(resultado.length).toBe(1);
    });
  });

  // =========================================================================
  // TC-PROD-004: Crear producto con validación de imágenes
  // =========================================================================
  describe('TC-PROD-004: Validación de imágenes', () => {
    test('debe crear producto con 1-5 imágenes', async () => {
      // Arrange
      const datosValidos = {
        nombre: 'Tomate',
        categoria: 'Verduras' as const,
        descripcion: 'Tomate',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb' as const,
        tiposEntrega: ['local'] as const,
      };

      // Act & Assert - 1 imagen
      const prod1 = await crearProducto('prod1', {
        ...datosValidos,
        imagenes: ['img1.jpg'],
      });
      expect(prod1.imagenes.length).toBe(1);

      // Act & Assert - 3 imágenes
      const prod3 = await crearProducto('prod1', {
        ...datosValidos,
        imagenes: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      });
      expect(prod3.imagenes.length).toBe(3);

      // Act & Assert - 5 imágenes
      const prod5 = await crearProducto('prod1', {
        ...datosValidos,
        imagenes: Array(5).fill('img.jpg'),
      });
      expect(prod5.imagenes.length).toBe(5);
    });

    test('debe rechazar 0 imágenes', async () => {
      // Act & Assert
      await expect(
        crearProducto('prod1', {
          nombre: 'Producto',
          categoria: 'Verduras',
          descripcion: 'Desc',
          precioUnitario: 10,
          precioMayor: 8,
          cantidadMayor: 5,
          cantidadDisponible: 100,
          unidadMedida: 'lb',
          imagenes: [],
          tiposEntrega: ['local'],
        })
      ).rejects.toThrow(/entre 1 y 5 imágenes/i);
    });

    test('debe rechazar > 5 imágenes', async () => {
      // Act & Assert
      await expect(
        crearProducto('prod1', {
          nombre: 'Producto',
          categoria: 'Verduras',
          descripcion: 'Desc',
          precioUnitario: 10,
          precioMayor: 8,
          cantidadMayor: 5,
          cantidadDisponible: 100,
          unidadMedida: 'lb',
          imagenes: Array(6).fill('img.jpg'),
          tiposEntrega: ['local'],
        })
      ).rejects.toThrow(/entre 1 y 5 imágenes/i);
    });
  });

  // =========================================================================
  // TC-PROD-005: Descontar stock al finalizar acuerdo
  // =========================================================================
  describe('TC-PROD-005: Descontar stock', () => {
    test('debe descontar stock correctamente', async () => {
      // Arrange
      const prod = await crearProducto('prod1', {
        nombre: 'Tomate',
        categoria: 'Verduras',
        descripcion: 'Tomate',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img.jpg'],
        tiposEntrega: ['local'],
      });

      // Act
      await descontarStock(prod.id, 25);
      const productoActualizado = await obtenerProducto(prod.id);

      // Assert
      expect(productoActualizado?.cantidadDisponible).toBe(75); // 100 - 25
    });

    test('debe evitar stock negativo', async () => {
      // Arrange
      const prod = await crearProducto('prod1', {
        nombre: 'Tomate',
        categoria: 'Verduras',
        descripcion: 'Tomate',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img.jpg'],
        tiposEntrega: ['local'],
      });

      // Act - Intentar descontar más de lo disponible
      await descontarStock(prod.id, 150);
      const productoActualizado = await obtenerProducto(prod.id);

      // Assert - Debe ser 0, no negativo
      expect(productoActualizado?.cantidadDisponible).toBe(0);
    });

    test('debe descontar stock múltiples veces', async () => {
      // Arrange
      const prod = await crearProducto('prod1', {
        nombre: 'Tomate',
        categoria: 'Verduras',
        descripcion: 'Tomate',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img.jpg'],
        tiposEntrega: ['local'],
      });

      // Act
      await descontarStock(prod.id, 20);
      await descontarStock(prod.id, 30);
      await descontarStock(prod.id, 15);
      const productoFinal = await obtenerProducto(prod.id);

      // Assert
      expect(productoFinal?.cantidadDisponible).toBe(35); // 100 - 20 - 30 - 15
    });
  });
});
