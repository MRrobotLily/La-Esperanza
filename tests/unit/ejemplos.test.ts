/**
 * Ejemplos de Tests Unitarios con Jest
 * Ubicación: tests/unit/
 * Ejecutar: npm run test:unit
 */

// ============================================================================
// TEST 1: authApi.ts — Verificar código SMS
// ============================================================================

import { verificarCodigoSMS, enviarCodigoSMS } from '../../src/api/authApi';

describe('authApi — verificarCodigoSMS', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('debe retornar ok=true con código correcto', async () => {
    // Arrange: Enviar código primero
    const { codigo } = await enviarCodigoSMS('+50234567890');

    // Act: Verificar el código correcto
    const result = await verificarCodigoSMS('+50234567890', codigo);

    // Assert
    expect(result.ok).toBe(true);
  });

  test('debe retornar motivo "invalido" con código incorrecto', async () => {
    // Arrange
    await enviarCodigoSMS('+50234567890');

    // Act
    const result = await verificarCodigoSMS('+50234567890', '000000');

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.motivo).toBe('invalido');
      expect(result.restantes).toBe(2); // 3 intentos - 1
    }
  });

  test('debe bloquear después de 3 intentos fallidos', async () => {
    // Arrange
    await enviarCodigoSMS('+50234567890');

    // Act: 3 intentos fallidos
    await verificarCodigoSMS('+50234567890', '111111');
    await verificarCodigoSMS('+50234567890', '222222');
    const tercerIntento = await verificarCodigoSMS('+50234567890', '333333');

    // Assert
    expect(tercerIntento.ok).toBe(false);
    if (!tercerIntento.ok) {
      expect(tercerIntento.motivo).toBe('bloqueado');
      expect(tercerIntento.bloqueadoHasta).toBeDefined();
    }
  });

  test('debe retornar motivo "expirado" después de 10 minutos', async () => {
    // Arrange
    await enviarCodigoSMS('+50234567890');

    // Mock Date.now() para simular paso de tiempo
    jest.useFakeTimers();
    jest.advanceTimersByTime(11 * 60 * 1000); // 11 minutos

    // Act
    const result = await verificarCodigoSMS('+50234567890', '123456');

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.motivo).toBe('expirado');
    }

    jest.useRealTimers();
  });
});

// ============================================================================
// TEST 2: productosApi.ts — Listar y filtrar productos
// ============================================================================

import { listarProductos, crearProducto, obtenerProducto } from '../../src/api/productosApi';
import type { Producto } from '../../src/types';

describe('productosApi — listarProductos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('debe retornar array vacío inicialmente', async () => {
    const productos = await listarProductos();
    expect(Array.isArray(productos)).toBe(true);
    expect(productos.length).toBe(0);
  });

  test('debe filtrar por categoría', async () => {
    // Arrange: Crear productos de diferentes categorías
    await crearProducto('productor1', {
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

    await crearProducto('productor1', {
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
    expect(verduras[0].nombre).toBe('Tomate');
    expect(frutas[0].nombre).toBe('Manzana');
  });

  test('debe filtrar por búsqueda (case-insensitive)', async () => {
    // Arrange
    await crearProducto('productor1', {
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
    const resultado = await listarProductos({ busqueda: 'TOMATE' });

    // Assert
    expect(resultado.length).toBe(1);
    expect(resultado[0].nombre).toContain('Tomate');
  });

  test('debe filtrar por productor', async () => {
    // Arrange
    await crearProducto('productor1', { /* ... */ });
    await crearProducto('productor2', { /* ... */ });

    // Act
    const productosProd1 = await listarProductos({ productorId: 'productor1' });

    // Assert
    expect(productosProd1.every(p => p.productorId === 'productor1')).toBe(true);
  });

  test('debe filtrar solo activos por defecto', async () => {
    // Arrange
    const prod = await crearProducto('productor1', { /* ... */ });
    await cambiarEstadoProducto(prod.id, false);

    // Act
    const activos = await listarProductos({ soloActivos: true });
    const todos = await listarProductos({ soloActivos: false });

    // Assert
    expect(activos.length).toBe(0);
    expect(todos.length).toBe(1);
  });
});

// ============================================================================
// TEST 3: calificacionesApi.ts — Calificaciones
// ============================================================================

import { calificar, calificacionesRecibidas, promedio, resumen } from '../../src/api/calificacionesApi';

describe('calificacionesApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('calificar debe crear registro con timestamp', async () => {
    // Act
    const calificacion = await calificar({
      autorId: 'u1',
      destinatarioId: 'u2',
      productorId: 'u2',
      estrellas: 5,
      resena: 'Excelente producto',
      acuerdoId: 'ac1',
      direccion: 'comprador_a_productor',
    });

    // Assert
    expect(calificacion.id).toBeDefined();
    expect(calificacion.autorId).toBe('u1');
    expect(calificacion.estrellas).toBe(5);
    expect(calificacion.creadoEn).toBeDefined();
  });

  test('calificacionesRecibidas debe retornar solo calificaciones del usuario', async () => {
    // Arrange
    await calificar({ autorId: 'u1', destinatarioId: 'u2', estrellas: 5, /* ... */ });
    await calificar({ autorId: 'u2', destinatarioId: 'u3', estrellas: 4, /* ... */ });

    // Act
    const recibidas = await calificacionesRecibidas('u2');

    // Assert
    expect(recibidas.length).toBe(1);
    expect(recibidas[0].destinatarioId).toBe('u2');
  });

  test('promedio debe calcular correctamente', () => {
    // Arrange
    const estrellas = [5, 4, 5, 3, 4];

    // Act
    const resultado = promedio(estrellas);

    // Assert
    expect(resultado).toBe(4.2);
  });

  test('promedio de array vacío debe retornar 0', () => {
    const resultado = promedio([]);
    expect(resultado).toBe(0);
  });

  test('resumen debe mostrar distribución de estrellas', () => {
    // Arrange
    const calificaciones = [
      { estrellas: 5 },
      { estrellas: 5 },
      { estrellas: 4 },
      { estrellas: 3 },
    ] as any[];

    // Act
    const resultado = resumen(calificaciones);

    // Assert
    expect(resultado.total).toBe(4);
    expect(resultado.promedio).toBe(4.25);
    expect(resultado.distribucion[5]).toBe(2);
    expect(resultado.distribucion[4]).toBe(1);
    expect(resultado.distribucion[3]).toBe(1);
  });
});

// ============================================================================
// TEST 4: carritoApi.ts — Operaciones de carrito
// ============================================================================

import {
  leerCarrito,
  guardarCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
} from '../../src/api/carritoApi';

describe('carritoApi', () => {
  const usuarioId = 'u1';

  beforeEach(() => {
    localStorage.clear();
  });

  test('leerCarrito retorna array vacío inicialmente', async () => {
    const items = await leerCarrito(usuarioId);
    expect(items).toEqual([]);
  });

  test('agregarAlCarrito debe agregar item o incrementar cantidad', async () => {
    // Act
    const items1 = await agregarAlCarrito(usuarioId, 'prod1', 5);
    const items2 = await agregarAlCarrito(usuarioId, 'prod1', 3);

    // Assert
    expect(items1.length).toBe(1);
    expect(items1[0].cantidad).toBe(5);
    expect(items2.length).toBe(1);
    expect(items2[0].cantidad).toBe(8); // 5 + 3
  });

  test('actualizarCantidad debe cambiar cantidad de item', async () => {
    // Arrange
    await agregarAlCarrito(usuarioId, 'prod1', 5);

    // Act
    const items = await actualizarCantidad(usuarioId, 'prod1', 10);

    // Assert
    expect(items[0].cantidad).toBe(10);
  });

  test('actualizarCantidad con 0 debe eliminar item', async () => {
    // Arrange
    await agregarAlCarrito(usuarioId, 'prod1', 5);

    // Act
    const items = await actualizarCantidad(usuarioId, 'prod1', 0);

    // Assert
    expect(items.length).toBe(0);
  });

  test('eliminarDelCarrito debe remover solo ese item', async () => {
    // Arrange
    await agregarAlCarrito(usuarioId, 'prod1', 5);
    await agregarAlCarrito(usuarioId, 'prod2', 3);

    // Act
    const items = await eliminarDelCarrito(usuarioId, 'prod1');

    // Assert
    expect(items.length).toBe(1);
    expect(items[0].productoId).toBe('prod2');
  });

  test('vaciarCarrito debe eliminar todo', async () => {
    // Arrange
    await agregarAlCarrito(usuarioId, 'prod1', 5);
    await agregarAlCarrito(usuarioId, 'prod2', 3);

    // Act
    await vaciarCarrito(usuarioId);
    const items = await leerCarrito(usuarioId);

    // Assert
    expect(items.length).toBe(0);
  });
});

// ============================================================================
// TEST 5: Validación de Schemas con Zod
// ============================================================================

import { perfilRegistroSchema, loginSchema } from '../../src/schemas/authSchemas';

describe('authSchemas', () => {
  test('perfilRegistroSchema debe validar datos correctos', () => {
    const datos = {
      nombre: 'Juan',
      apellido: 'Pérez',
      direccion: 'Calle Principal 123',
      departamento: 'Guatemala',
      municipio: 'Guatemala',
      rol: 'comprador',
    };

    const resultado = perfilRegistroSchema.safeParse(datos);
    expect(resultado.success).toBe(true);
  });

  test('perfilRegistroSchema debe rechazar nombre vacío', () => {
    const datos = {
      nombre: '',
      apellido: 'Pérez',
      rol: 'comprador',
    };

    const resultado = perfilRegistroSchema.safeParse(datos);
    expect(resultado.success).toBe(false);
  });

  test('perfilRegistroSchema debe rechazar rol inválido', () => {
    const datos = {
      nombre: 'Juan',
      apellido: 'Pérez',
      rol: 'admin', // rol no permitido
    };

    const resultado = perfilRegistroSchema.safeParse(datos);
    expect(resultado.success).toBe(false);
  });
});

// ============================================================================
// TEST 6: Componentes React con React Testing Library
// ============================================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';

describe('Button Component', () => {
  test('debe renderizar con texto correcto', () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByText('Enviar')).toBeInTheDocument();
  });

  test('debe llamar onClick cuando se clickea', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('debe estar deshabilitado cuando disabled=true', () => {
    render(<Button disabled>Botón deshabilitado</Button>);
    expect(screen.getByText('Botón deshabilitado')).toBeDisabled();
  });
});

describe('Input Component', () => {
  test('debe actualizar valor cuando se escribe', () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} placeholder="Escribe aquí" />);

    const input = screen.getByPlaceholderText('Escribe aquí');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalled();
  });

  test('debe mostrar error cuando requerido y vacío', () => {
    render(<Input required error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });
});
