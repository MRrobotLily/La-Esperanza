/**
 * Tests del Comité — Basados en casos de prueba TC-COM-*
 * Archivo: tests/unit/comiteApi.test.ts
 */

import {
  listarUsuariosParaComite,
  advertirUsuario,
  observarUsuario,
  suspenderUsuario,
  cancelarUsuario,
  reactivarUsuario,
  listarAuditoria,
  historialUsuario,
  estadisticas,
} from '../../src/api/comiteApi';
import {
  crearProducto,
} from '../../src/api/productosApi';
import {
  crearAcuerdo,
  aceptarAcuerdo,
  confirmarEntrega,
} from '../../src/api/acuerdosApi';
import { registrarUsuario } from '../../src/api/authApi';

describe('⚖️ Comité', () => {
  let comite: any;
  let usuario: any;

  beforeEach(async () => {
    localStorage.clear();

    comite = await registrarUsuario({
      telefono: '+50211111111',
      dpi: '9999999999999',
      dpiFotoUrl: 'data:image/jpeg;base64,test',
      nombre: 'Admin',
      apellido: 'Comité',
      rol: 'comite',
    });

    usuario = await registrarUsuario({
      telefono: '+50234567890',
      dpi: '1111111111111',
      dpiFotoUrl: 'data:image/jpeg;base64,test',
      nombre: 'Usuario',
      apellido: 'Test',
      rol: 'comprador',
    });
  });

  // =========================================================================
  // TC-COM-001: Suspender usuario por N días
  // =========================================================================
  describe('TC-COM-001: Suspender usuario', () => {
    test('debe cambiar estado a suspendida', async () => {
      // Act
      const usuarioSuspendido = await suspenderUsuario(
        comite.id,
        usuario.id,
        'Lenguaje ofensivo en chat',
        7
      );

      // Assert
      expect(usuarioSuspendido.estado).toBe('suspendida');
      expect(usuarioSuspendido.motivoSuspension).toBe('Lenguaje ofensivo en chat');
      expect(usuarioSuspendido.suspendidoHasta).toBeDefined();
    });

    test('debe calcular fecha de reactivación correctamente', async () => {
      // Act
      const usuarioSuspendido = await suspenderUsuario(
        comite.id,
        usuario.id,
        'Motivo test',
        7
      );

      // Assert
      const ahora = new Date();
      const suspendidoHasta = new Date(usuarioSuspendido.suspendidoHasta!);
      const diasDiferencia = Math.round(
        (suspendidoHasta.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(diasDiferencia).toBeGreaterThanOrEqual(6); // ~7 días
      expect(diasDiferencia).toBeLessThanOrEqual(7);
    });

    test('debe registrar en auditoría', async () => {
      // Act
      await suspenderUsuario(
        comite.id,
        usuario.id,
        'Motivo test',
        7
      );
      const auditoria = await listarAuditoria();

      // Assert
      expect(auditoria.length).toBeGreaterThan(0);
      const registro = auditoria.find(
        (a) => a.usuarioAfectadoId === usuario.id && a.tipo === 'suspension_temporal'
      );
      expect(registro).toBeDefined();
      expect(registro?.duracionDias).toBe(7);
    });
  });

  // =========================================================================
  // TC-COM-002: Cancelar usuario permanentemente
  // =========================================================================
  describe('TC-COM-002: Cancelar usuario', () => {
    test('debe cambiar estado a cancelada', async () => {
      // Act
      const usuarioCancelado = await cancelarUsuario(
        comite.id,
        usuario.id,
        'Incumplimiento de acuerdos'
      );

      // Assert
      expect(usuarioCancelado.estado).toBe('cancelada');
      expect(usuarioCancelado.motivoSuspension).toBe('Incumplimiento de acuerdos');
    });

    test('debe impedir reactivar cuenta cancelada', async () => {
      // Arrange
      await cancelarUsuario(comite.id, usuario.id, 'Motivo test');

      // Act & Assert
      await expect(
        reactivarUsuario(comite.id, usuario.id, 'Motivo reactivación')
      ).rejects.toThrow(/canceladas permanentemente no pueden reactivarse/i);
    });

    test('debe registrar en auditoría', async () => {
      // Act
      await cancelarUsuario(comite.id, usuario.id, 'Motivo test');
      const auditoria = await listarAuditoria();

      // Assert
      const registro = auditoria.find(
        (a) => a.usuarioAfectadoId === usuario.id && a.tipo === 'cancelacion_permanente'
      );
      expect(registro).toBeDefined();
    });
  });

  // =========================================================================
  // TC-COM-003: Reactivar usuario suspendido
  // =========================================================================
  describe('TC-COM-003: Reactivar usuario', () => {
    test('debe cambiar estado a activa', async () => {
      // Arrange
      await suspenderUsuario(comite.id, usuario.id, 'Test', 7);

      // Act
      const usuarioReactivado = await reactivarUsuario(
        comite.id,
        usuario.id,
        'Se cumplió el plazo'
      );

      // Assert
      expect(usuarioReactivado.estado).toBe('activa');
      expect(usuarioReactivado.suspendidoHasta).toBeUndefined();
      expect(usuarioReactivado.motivoSuspension).toBeUndefined();
    });

    test('debe registrar reactivación en auditoría', async () => {
      // Arrange
      await suspenderUsuario(comite.id, usuario.id, 'Test', 7);

      // Act
      await reactivarUsuario(comite.id, usuario.id, 'Se cumplió plazo');
      const auditoria = await listarAuditoria();

      // Assert
      const registro = auditoria.find(
        (a) => a.usuarioAfectadoId === usuario.id && a.tipo === 'reactivacion'
      );
      expect(registro).toBeDefined();
    });
  });

  // =========================================================================
  // Acciones adicionales del comité
  // =========================================================================
  describe('Advertencia y observación', () => {
    test('debe crear advertencia sin cambiar estado', async () => {
      // Act
      await advertirUsuario(comite.id, usuario.id, 'Advertencia por comportamiento');
      const auditoria = await listarAuditoria();

      // Assert
      const registro = auditoria.find(
        (a) => a.usuarioAfectadoId === usuario.id && a.tipo === 'advertencia'
      );
      expect(registro).toBeDefined();
    });

    test('debe crear observación', async () => {
      // Act
      await observarUsuario(comite.id, usuario.id, 'Observación por patrones');
      const auditoria = await listarAuditoria();

      // Assert
      const registro = auditoria.find(
        (a) => a.usuarioAfectadoId === usuario.id && a.tipo === 'observacion'
      );
      expect(registro).toBeDefined();
    });
  });

  // =========================================================================
  // TC-COM-004: Estadísticas del comité
  // =========================================================================
  describe('TC-COM-004: Estadísticas', () => {
    test('debe retornar estadísticas básicas', async () => {
      // Act
      const stats = await estadisticas();

      // Assert
      expect(stats.totalUsuarios).toBeGreaterThanOrEqual(2); // comite + usuario
      expect(stats.productores).toBeGreaterThanOrEqual(0);
      expect(stats.compradores).toBeGreaterThanOrEqual(1);
      expect(stats.suspendidos).toBeGreaterThanOrEqual(0);
      expect(stats.cancelados).toBeGreaterThanOrEqual(0);
    });

    test('debe contar usuarios suspendidos', async () => {
      // Arrange
      const stats1 = await estadisticas();

      // Act
      await suspenderUsuario(comite.id, usuario.id, 'Test', 7);
      const stats2 = await estadisticas();

      // Assert
      expect(stats2.suspendidos).toBe(stats1.suspendidos + 1);
    });

    test('debe contar usuarios cancelados', async () => {
      // Arrange
      const stats1 = await estadisticas();

      // Act
      await cancelarUsuario(comite.id, usuario.id, 'Test');
      const stats2 = await estadisticas();

      // Assert
      expect(stats2.cancelados).toBe(stats1.cancelados + 1);
    });

    test('debe incluir estadísticas de productos y acuerdos', async () => {
      // Arrange
      const productor = await registrarUsuario({
        telefono: '+50287654321',
        dpi: '2222222222222',
        dpiFotoUrl: 'data:image/jpeg;base64,test',
        nombre: 'Productor',
        apellido: 'Test',
        rol: 'productor',
      });

      const producto = await crearProducto(productor.id, {
        nombre: 'Producto Test',
        categoria: 'Verduras',
        descripcion: 'Test',
        precioUnitario: 10,
        precioMayor: 8,
        cantidadMayor: 5,
        cantidadDisponible: 100,
        unidadMedida: 'lb',
        imagenes: ['img.jpg'],
        tiposEntrega: ['local'],
      });

      // Act
      const stats = await estadisticas();

      // Assert
      expect(stats.productosActivos).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // Historial y auditoría
  // =========================================================================
  describe('Historial y auditoría', () => {
    test('debe retornar historial de usuario', async () => {
      // Arrange
      await advertirUsuario(comite.id, usuario.id, 'Advertencia 1');
      await advertirUsuario(comite.id, usuario.id, 'Advertencia 2');

      // Act
      const historial = await historialUsuario(usuario.id);

      // Assert
      expect(historial.length).toBeGreaterThanOrEqual(2);
      expect(historial.every((a) => a.usuarioAfectadoId === usuario.id)).toBe(true);
    });

    test('debe listar toda la auditoría', async () => {
      // Arrange
      await advertirUsuario(comite.id, usuario.id, 'Test');

      // Act
      const auditoria = await listarAuditoria();

      // Assert
      expect(auditoria.length).toBeGreaterThan(0);
      expect(auditoria[0].comiteId).toBe(comite.id);
    });

    test('debe mostrar timestamps de auditoría', async () => {
      // Act
      await advertirUsuario(comite.id, usuario.id, 'Test');
      const auditoria = await listarAuditoria();

      // Assert
      expect(auditoria[0].creadoEn).toBeDefined();
      const fecha = new Date(auditoria[0].creadoEn);
      expect(fecha instanceof Date && !isNaN(fecha.getTime())).toBe(true);
    });
  });

  // =========================================================================
  // Listar usuarios para comité
  // =========================================================================
  describe('Listar usuarios', () => {
    test('debe retornar lista de usuarios', async () => {
      // Act
      const usuarios = await listarUsuariosParaComite();

      // Assert
      expect(Array.isArray(usuarios)).toBe(true);
      expect(usuarios.length).toBeGreaterThanOrEqual(2); // comite + usuario
    });

    test('debe ordenar por más recientes primero', async () => {
      // Arrange
      const user1 = await registrarUsuario({
        telefono: '+50211111111',
        dpi: '3333333333333',
        dpiFotoUrl: 'data:image/jpeg;base64,test',
        nombre: 'User1',
        apellido: 'Test',
        rol: 'comprador',
      });

      const user2 = await registrarUsuario({
        telefono: '+50212222222',
        dpi: '4444444444444',
        dpiFotoUrl: 'data:image/jpeg;base64,test',
        nombre: 'User2',
        apellido: 'Test',
        rol: 'comprador',
      });

      // Act
      const usuarios = await listarUsuariosParaComite();

      // Assert
      const idx1 = usuarios.findIndex((u) => u.id === user1.id);
      const idx2 = usuarios.findIndex((u) => u.id === user2.id);
      expect(idx2).toBeLessThan(idx1); // user2 más reciente va primero
    });
  });
});
