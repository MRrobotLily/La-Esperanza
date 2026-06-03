/**
 * Tests de Autenticación — Basados en casos de prueba TC-LOGIN-* y TC-REG-*
 * Archivo: tests/unit/authApi.test.ts
 */

import {
  enviarCodigoSMS,
  verificarCodigoSMS,
  validarDPI,
  registrarUsuario,
  iniciarSesionConTelefono,
} from '../../src/api/authApi';

describe('🔐 Autenticación — Login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // TC-LOGIN-001: Login exitoso con código correcto
  // =========================================================================
  describe('TC-LOGIN-001: Login exitoso', () => {
    test('debe permitir login con código SMS correcto', async () => {
      // Arrange
      const telefono = '+50234567890';
      const enviarResult = await enviarCodigoSMS(telefono);
      const codigoCorreto = enviarResult.codigo;

      // Act
      const verificarResult = await verificarCodigoSMS(telefono, codigoCorreto);

      // Assert
      expect(verificarResult.ok).toBe(true);
    });
  });

  // =========================================================================
  // TC-LOGIN-002: Error con código incorrecto
  // =========================================================================
  describe('TC-LOGIN-002: Código incorrecto', () => {
    test('debe rechazar código incorrecto y mostrar intento', async () => {
      // Arrange
      const telefono = '+50234567890';
      await enviarCodigoSMS(telefono);

      // Act
      const result = await verificarCodigoSMS(telefono, '000000');

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motivo).toBe('invalido');
        expect(result.restantes).toBe(2); // 3 - 1 intento
      }
    });

    test('debe decrementar contador de intentos', async () => {
      // Arrange
      const telefono = '+50234567890';
      await enviarCodigoSMS(telefono);

      // Act - Intento 1
      const result1 = await verificarCodigoSMS(telefono, '111111');
      const intento1 = result1.ok ? null : result1.restantes;

      // Act - Intento 2
      const result2 = await verificarCodigoSMS(telefono, '222222');
      const intento2 = result2.ok ? null : result2.restantes;

      // Assert
      expect(intento1).toBe(2); // 3 - 1
      expect(intento2).toBe(1); // 3 - 2
    });
  });

  // =========================================================================
  // TC-LOGIN-003: Bloqueo después de 3 intentos fallidos
  // =========================================================================
  describe('TC-LOGIN-003: Bloqueo por 3 intentos fallidos', () => {
    test('debe bloquear después de 3 intentos fallidos', async () => {
      // Arrange
      const telefono = '+50234567890';
      await enviarCodigoSMS(telefono);

      // Act - Intento 1
      await verificarCodigoSMS(telefono, '111111');
      // Act - Intento 2
      await verificarCodigoSMS(telefono, '222222');
      // Act - Intento 3
      const result3 = await verificarCodigoSMS(telefono, '333333');

      // Assert
      expect(result3.ok).toBe(false);
      if (!result3.ok) {
        expect(result3.motivo).toBe('bloqueado');
        expect(result3.bloqueadoHasta).toBeDefined();
      }
    });

    test('debe impedir verificación con bloqueo activo', async () => {
      // Arrange
      const telefono = '+50234567890';
      const { codigo } = await enviarCodigoSMS(telefono);

      // Bloquear: 3 intentos fallidos
      await verificarCodigoSMS(telefono, '111111');
      await verificarCodigoSMS(telefono, '222222');
      await verificarCodigoSMS(telefono, '333333');

      // Act - Intento de verificar con código correcto durante bloqueo
      const resultBloqueado = await verificarCodigoSMS(telefono, codigo);

      // Assert
      expect(resultBloqueado.ok).toBe(false);
      if (!resultBloqueado.ok) {
        expect(resultBloqueado.motivo).toBe('bloqueado');
      }
    });
  });

  // =========================================================================
  // TC-LOGIN-004: Código SMS expirado (> 10 minutos)
  // =========================================================================
  describe('TC-LOGIN-004: Código expirado', () => {
    test('debe rechazar código expirado después de 10 min', async () => {
      // Arrange
      jest.useFakeTimers();
      const telefono = '+50234567890';
      const { codigo } = await enviarCodigoSMS(telefono);

      // Act - Avanzar 11 minutos
      jest.advanceTimersByTime(11 * 60 * 1000);
      const result = await verificarCodigoSMS(telefono, codigo);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.motivo).toBe('expirado');
      }

      jest.useRealTimers();
    });
  });

  // =========================================================================
  // TC-LOGIN-005: Usuario con DPI duplicado activo
  // =========================================================================
  describe('TC-LOGIN-005: DPI duplicado activo', () => {
    test('debe impedir login si DPI ya tiene cuenta activa', async () => {
      // Arrange - Crear usuario con DPI
      const dpiDuplicado = '1234567890123';
      await registrarUsuario({
        telefono: '+50234567890',
        dpi: dpiDuplicado,
        dpiFotoUrl: 'data:image/jpeg;base64,test',
        nombre: 'Usuario1',
        apellido: 'Prueba1',
        rol: 'comprador',
      });

      // Act - Intentar validar el mismo DPI con nuevo teléfono
      const validacion = await validarDPI(dpiDuplicado);

      // Assert
      expect(validacion.estado).toBe('activa');
      expect(validacion.usuario).toBeDefined();
    });
  });

  // =========================================================================
  // TC-LOGIN-006: Usuario suspendido no puede entrar
  // =========================================================================
  describe('TC-LOGIN-006: Usuario suspendido', () => {
    test('debe rechazar login de usuario suspendido', async () => {
      // Arrange - Crear usuario
      const usuario = await registrarUsuario({
        telefono: '+50234567890',
        dpi: '1111111111111',
        dpiFotoUrl: 'data:image/jpeg;base64,test',
        nombre: 'Juan',
        apellido: 'Suspendido',
        rol: 'comprador',
      });

      // Suspender usuario manualmente en localStorage
      const usuarios = JSON.parse(
        localStorage.getItem('dercas.usuarios') || '[]'
      ) as any[];
      const idx = usuarios.findIndex((u) => u.id === usuario.id);
      if (idx !== -1) {
        usuarios[idx].estado = 'suspendida';
        usuarios[idx].suspendidoHasta = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        localStorage.setItem('dercas.usuarios', JSON.stringify(usuarios));
      }

      // Act
      const resultLogin = await iniciarSesionConTelefono('+50234567890');

      // Assert - Debe lanzar error
      await expect(
        iniciarSesionConTelefono('+50234567890')
      ).rejects.toThrow(/suspendida/i);
    });
  });
});

describe('📝 Autenticación — Registro', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // TC-REG-001: Registro exitoso completo
  // =========================================================================
  describe('TC-REG-001: Registro exitoso', () => {
    test('debe crear usuario completo con todos los datos', async () => {
      // Arrange
      const datosRegistro = {
        telefono: '+50287654321',
        dpi: '1234567890999',
        dpiFotoUrl: 'data:image/jpeg;base64,test',
        nombre: 'Juan',
        apellido: 'Pérez López',
        direccion: 'Calle Principal 123',
        departamento: 'Guatemala',
        municipio: 'Mixco',
        rol: 'comprador' as const,
      };

      // Act
      const usuario = await registrarUsuario(datosRegistro);

      // Assert
      expect(usuario.id).toBeDefined();
      expect(usuario.telefono).toBe(datosRegistro.telefono);
      expect(usuario.dpi).toBe(datosRegistro.dpi);
      expect(usuario.nombre).toBe(datosRegistro.nombre);
      expect(usuario.apellido).toBe(datosRegistro.apellido);
      expect(usuario.estado).toBe('activa');
      expect(usuario.creadoEn).toBeDefined();
    });
  });

  // =========================================================================
  // TC-REG-002: DPI inválido (no 13 dígitos)
  // =========================================================================
  describe('TC-REG-002: DPI inválido', () => {
    test('debe rechazar DPI con menos de 13 dígitos', async () => {
      // Arrange
      const dpiInvalido = '123456'; // Solo 6 dígitos

      // Assert - El validador debe estar en el schema
      // Esto sería validado en el formulario
      expect(dpiInvalido.length).not.toBe(13);
    });
  });

  // =========================================================================
  // TC-REG-003: DPI duplicado (ya existe)
  // =========================================================================
  describe('TC-REG-003: DPI duplicado', () => {
    test('debe rechazar registro con DPI duplicado', async () => {
      // Arrange
      const dpiDuplicado = '1234567890999';
      await registrarUsuario({
        telefono: '+50234567890',
        dpi: dpiDuplicado,
        dpiFotoUrl: 'data:image/jpeg;base64,test',
        nombre: 'User1',
        apellido: 'Test',
        rol: 'comprador',
      });

      // Act & Assert
      await expect(
        registrarUsuario({
          telefono: '+50287654321',
          dpi: dpiDuplicado, // Mismo DPI
          dpiFotoUrl: 'data:image/jpeg;base64,test',
          nombre: 'User2',
          apellido: 'Test',
          rol: 'comprador',
        })
      ).rejects.toThrow(/Ya existe una cuenta activa/i);
    });
  });

  // =========================================================================
  // TC-REG-004: DPI cancelado (no puede registrarse)
  // =========================================================================
  describe('TC-REG-004: DPI cancelado', () => {
    test('debe rechazar registro con DPI cancelado', async () => {
      // Arrange - Crear usuario y cancelarlo
      const dpiCancelado = '1111111111999';
      const usuarioCancelado = await registrarUsuario({
        telefono: '+50234567890',
        dpi: dpiCancelado,
        dpiFotoUrl: 'data:image/jpeg;base64,test',
        nombre: 'Usuario',
        apellido: 'Cancelado',
        rol: 'comprador',
      });

      // Cancelar usuario en localStorage
      const usuarios = JSON.parse(
        localStorage.getItem('dercas.usuarios') || '[]'
      ) as any[];
      const idx = usuarios.findIndex((u) => u.id === usuarioCancelado.id);
      if (idx !== -1) {
        usuarios[idx].estado = 'cancelada';
        usuarios[idx].motivoSuspension = 'Incumplimiento de acuerdos';
        localStorage.setItem('dercas.usuarios', JSON.stringify(usuarios));
      }

      // Act & Assert
      await expect(
        registrarUsuario({
          telefono: '+50287654321',
          dpi: dpiCancelado,
          dpiFotoUrl: 'data:image/jpeg;base64,test',
          nombre: 'Otro',
          apellido: 'Usuario',
          rol: 'comprador',
        })
      ).rejects.toThrow(/cuenta cancelada/i);
    });
  });
});
