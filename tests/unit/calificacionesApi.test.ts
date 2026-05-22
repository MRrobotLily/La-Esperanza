/**
 * Tests de Calificaciones — Basados en casos de prueba TC-CAL-*
 * Archivo: tests/unit/calificacionesApi.test.ts
 */

import {
  calificar,
  calificacionesRecibidas,
  yaCalificoAcuerdo,
  promedio,
  resumen,
  calificacionesPorProducto,
} from '../../src/api/calificacionesApi';
import { registrarUsuario } from '../../src/api/authApi';

describe('⭐ Calificaciones', () => {
  let usuario1: any;
  let usuario2: any;

  beforeEach(async () => {
    localStorage.clear();

    usuario1 = await registrarUsuario({
      telefono: '+50234567890',
      dpi: '1111111111111',
      dpiFotoUrl: 'data:image/jpeg;base64,test',
      nombre: 'Usuario1',
      apellido: 'Test',
      rol: 'comprador',
    });

    usuario2 = await registrarUsuario({
      telefono: '+50287654321',
      dpi: '2222222222222',
      dpiFotoUrl: 'data:image/jpeg;base64,test',
      nombre: 'Usuario2',
      apellido: 'Test',
      rol: 'productor',
    });
  });

  // =========================================================================
  // TC-CAL-001: Calificar con 5 estrellas y reseña
  // =========================================================================
  describe('TC-CAL-001: Calificar con reseña', () => {
    test('debe crear calificación con todos los campos', async () => {
      // Act
      const calificacion = await calificar({
        autorId: usuario1.id,
        destinatarioId: usuario2.id,
        productorId: usuario2.id,
        acuerdoId: 'ac_123',
        estrellas: 5,
        resena: 'Excelente producto y entrega rápida',
        direccion: 'comprador_a_productor',
      });

      // Assert
      expect(calificacion.id).toBeDefined();
      expect(calificacion.autorId).toBe(usuario1.id);
      expect(calificacion.destinatarioId).toBe(usuario2.id);
      expect(calificacion.estrellas).toBe(5);
      expect(calificacion.resena).toBe('Excelente producto y entrega rápida');
      expect(calificacion.creadoEn).toBeDefined();
    });
  });

  // =========================================================================
  // TC-CAL-002: Validar que no se puede calificar dos veces
  // =========================================================================
  describe('TC-CAL-002: No calificar dos veces', () => {
    test('debe detectar si ya se calificó un acuerdo', async () => {
      // Arrange
      const acuerdoId = 'ac_123';
      await calificar({
        autorId: usuario1.id,
        destinatarioId: usuario2.id,
        productorId: usuario2.id,
        acuerdoId,
        estrellas: 5,
        resena: 'Bueno',
        direccion: 'comprador_a_productor',
      });

      // Act
      const yaCalificoResult = await yaCalificoAcuerdo(
        acuerdoId,
        usuario1.id,
        'comprador_a_productor'
      );

      // Assert
      expect(yaCalificoResult).toBe(true);
    });

    test('debe retornar false si aún no se calificó', async () => {
      // Act
      const yaCalificoResult = await yaCalificoAcuerdo(
        'ac_diferente',
        usuario1.id,
        'comprador_a_productor'
      );

      // Assert
      expect(yaCalificoResult).toBe(false);
    });
  });

  // =========================================================================
  // TC-CAL-003: Promedio de reputación
  // =========================================================================
  describe('TC-CAL-003: Promedio y distribución', () => {
    test('debe calcular promedio correcto', () => {
      // Arrange
      const estrellas = [5, 4, 5, 3, 4];

      // Act
      const resultado = promedio(estrellas);

      // Assert
      expect(resultado).toBe(4.2); // (5+4+5+3+4) / 5
    });

    test('debe retornar 0 para array vacío', () => {
      // Act
      const resultado = promedio([]);

      // Assert
      expect(resultado).toBe(0);
    });

    test('debe calcular distribución de estrellas', () => {
      // Arrange
      const calificaciones = [
        { estrellas: 5, autorId: 'a1', destinatarioId: 'd1', direccion: 'comprador_a_productor' as const },
        { estrellas: 5, autorId: 'a2', destinatarioId: 'd1', direccion: 'comprador_a_productor' as const },
        { estrellas: 4, autorId: 'a3', destinatarioId: 'd1', direccion: 'comprador_a_productor' as const },
        { estrellas: 3, autorId: 'a4', destinatarioId: 'd1', direccion: 'comprador_a_productor' as const },
        { estrellas: 4, autorId: 'a5', destinatarioId: 'd1', direccion: 'comprador_a_productor' as const },
      ] as any[];

      // Act
      const resultado = resumen(calificaciones);

      // Assert
      expect(resultado.total).toBe(5);
      expect(resultado.promedio).toBe(4.2);
      expect(resultado.distribucion[5]).toBe(2);
      expect(resultado.distribucion[4]).toBe(2);
      expect(resultado.distribucion[3]).toBe(1);
      expect(resultado.distribucion[2]).toBe(0);
      expect(resultado.distribucion[1]).toBe(0);
    });
  });

  // =========================================================================
  // Calificaciones recibidas
  // =========================================================================
  describe('Calificaciones recibidas', () => {
    test('debe retornar solo calificaciones recibidas por usuario', async () => {
      // Arrange
      await calificar({
        autorId: usuario1.id,
        destinatarioId: usuario2.id,
        productorId: usuario2.id,
        acuerdoId: 'ac_1',
        estrellas: 5,
        resena: 'Excelente',
        direccion: 'comprador_a_productor',
      });

      await calificar({
        autorId: usuario2.id,
        destinatarioId: usuario1.id,
        productorId: usuario1.id,
        acuerdoId: 'ac_1',
        estrellas: 4,
        resena: 'Muy bien',
        direccion: 'productor_a_comprador',
      });

      // Act
      const recibidas = await calificacionesRecibidas(usuario2.id);

      // Assert
      expect(recibidas.length).toBe(1);
      expect(recibidas[0].destinatarioId).toBe(usuario2.id);
      expect(recibidas[0].autorId).toBe(usuario1.id);
    });

    test('debe ordenar por más recientes primero', async () => {
      // Arrange
      const cal1 = await calificar({
        autorId: usuario1.id,
        destinatarioId: usuario2.id,
        productorId: usuario2.id,
        acuerdoId: 'ac_1',
        estrellas: 5,
        resena: 'Primera',
        direccion: 'comprador_a_productor',
      });

      const cal2 = await calificar({
        autorId: usuario1.id,
        destinatarioId: usuario2.id,
        productorId: usuario2.id,
        acuerdoId: 'ac_2',
        estrellas: 4,
        resena: 'Segunda',
        direccion: 'comprador_a_productor',
      });

      // Act
      const recibidas = await calificacionesRecibidas(usuario2.id);

      // Assert
      expect(recibidas[0].id).toBe(cal2.id); // Más reciente primero
      expect(recibidas[1].id).toBe(cal1.id);
    });
  });

  // =========================================================================
  // Calificaciones por producto
  // =========================================================================
  describe('Calificaciones por producto', () => {
    test('debe retornar calificaciones de un producto', async () => {
      // Arrange
      await calificar({
        autorId: usuario1.id,
        destinatarioId: usuario2.id,
        productorId: usuario2.id,
        productoId: 'prod_1',
        acuerdoId: 'ac_1',
        estrellas: 5,
        resena: 'Buen producto',
        direccion: 'comprador_a_productor',
      });

      await calificar({
        autorId: usuario1.id,
        destinatarioId: usuario2.id,
        productorId: usuario2.id,
        productoId: 'prod_2',
        acuerdoId: 'ac_2',
        estrellas: 4,
        resena: 'Otro producto',
        direccion: 'comprador_a_productor',
      });

      // Act
      const calificacionesProd1 = await calificacionesPorProducto('prod_1');

      // Assert
      expect(calificacionesProd1.length).toBe(1);
      expect(calificacionesProd1[0].productoId).toBe('prod_1');
    });
  });

  // =========================================================================
  // Ratings de 1-5 estrellas
  // =========================================================================
  describe('Rating de 1-5 estrellas', () => {
    test('debe aceptar ratings entre 1 y 5', async () => {
      // Arrange
      const ratings = [1, 2, 3, 4, 5];

      // Act & Assert
      for (const rating of ratings) {
        const cal = await calificar({
          autorId: usuario1.id,
          destinatarioId: usuario2.id,
          productorId: usuario2.id,
          acuerdoId: `ac_${rating}`,
          estrellas: rating,
          resena: `Rating ${rating}`,
          direccion: 'comprador_a_productor',
        });

        expect(cal.estrellas).toBe(rating);
      }
    });
  });
});
