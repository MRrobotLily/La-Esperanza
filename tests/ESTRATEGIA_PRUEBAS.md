# 📋 Guía de Estrategia de Pruebas — La Esperanza

## 1. ALCANCE DE LAS PRUEBAS

### 1.1 Módulos Cubiertos
- ✅ **Autenticación** (login, registro, validación DPI, SMS)
- ✅ **Catálogo de Productos** (listar, filtrar, buscar, agregar carrito)
- ✅ **Acuerdos de Compra** (crear, aceptar, rechazar, confirmar entrega)
- ✅ **Calificaciones y Reputación** (1-5 estrellas, reseñas)
- ✅ **Mensajería** (chat, notificaciones)
- ✅ **Comité** (auditoría, suspensiones, cancelaciones)
- ✅ **Carrito de Compras** (CRUD de items)

### 1.2 Usuarios de Prueba
| Rol | Teléfono | DPI | Estado |
|-----|----------|-----|--------|
| Comprador | 34567890 | 1234567890123 | Activa |
| Productor | 87654321 | 1234567890124 | Activa |
| Comité | 11111111 | 1234567890125 | Activa |

### 1.3 Ambientes
- **Desarrollo** (localhost:5173) — con datos simulados en localStorage
- **Staging** — simulación de backend real
- **Producción** — backend HTTP real + SMS Twilio

---

## 2. TIPOS DE PRUEBAS

### 2.1 Pruebas Unitarias

**Qué son:** Validan funciones/componentes individuales sin dependencias externas.

**Ejemplos:**
```typescript
// Test: verificarCodigoSMS retorna error por código incorrecto
test('verificarCodigoSMS debe retornar motivo "invalido"', async () => {
  const result = await verificarCodigoSMS('+50234567890', '000000');
  expect(result.ok).toBe(false);
  expect(result.motivo).toBe('invalido');
});

// Test: calcular promedio de calificaciones
test('promedio() debe calcular correctamente', () => {
  const estrellas = [5, 4, 5, 3];
  const resultado = promedio(estrellas);
  expect(resultado).toBe(4.25);
});
```

**Herramientas:** Jest, Vitest

**Ubicación:** `tests/unit/` — test files: `*.test.ts` o `*.spec.ts`

**Cobertura mínima:** 80% de funciones core

---

### 2.2 Pruebas de Integración

**Qué son:** Validan que múltiples módulos funcionen juntos (API + componentes).

**Ejemplos:**
```typescript
// Test: Crear usuario → Guardarlo → Recuperarlo
test('Flujo completo: registrar usuario y recuperarlo', async () => {
  const usuario = await registrarUsuario({
    telefono: '+50234567890',
    dpi: '1234567890123',
    nombre: 'Juan',
    rol: 'comprador',
  });
  
  const recuperado = await obtenerUsuarioActual();
  expect(recuperado.id).toBe(usuario.id);
});

// Test: Crear acuerdo → Validar stock
test('Crear acuerdo debe descontar stock', async () => {
  const acuerdo = await crearAcuerdo({
    compradorId: 'c1',
    productorId: 'p1',
    items: [{ productoId: 'prod1', cantidad: 5 }],
  });
  
  const producto = await obtenerProducto('prod1');
  expect(producto.cantidadDisponible).toBeLessThan(100); // stock inicial
});
```

**Herramientas:** Jest (con msw para mocks HTTP), React Testing Library

**Ubicación:** `tests/integration/` — test files: `*.integration.test.ts`

**Cobertura:** 60% de flujos críticos

---

### 2.3 Pruebas de Aceptación (E2E)

**Qué son:** Simulan usuario real navegando por la app completa.

**Ejemplos cubiertos en Selenium:**
```javascript
// Ver tests/e2e/selenium-login-registro.js
// - Cargar página de login
// - Enviar código SMS
// - Verificar código incorrecto
// - Flujo completo de registro
// - Buscar y agregar producto al carrito
// - Performance
// - Accesibilidad
```

**Herramientas:** Selenium WebDriver, Cypress, Playwright

**Ubicación:** `tests/e2e/` — archivos `.js`

**Cobertura:** Los 3 flujos principales (login, compra, registro)

---

### 2.4 Pruebas de Regresión

**Qué son:** Verifican que cambios nuevos no rompan funcionalidad existente.

**Ejecución:**
```bash
# Ejecutar toda la suite después de cambios
npm run test:unit && npm run test:integration && npm run test:e2e
```

**Criterio de pase:** 100% de tests deben pasar

---

### 2.5 Pruebas de Validación de Datos (Schema)

**Qué son:** Validan que datos cumplen estructura esperada (Zod schemas).

**Ejemplos:**
```typescript
// Test: perfilRegistroSchema valida correctamente
test('perfilRegistroSchema rechaza email inválido', () => {
  const datos = {
    nombre: 'Juan',
    apellido: 'Pérez',
    // ... falta email válido
  };
  expect(() => perfilRegistroSchema.parse(datos)).toThrow();
});
```

**Ubicación:** `tests/schemas/` — test files: `*.schema.test.ts`

---

### 2.6 Pruebas de Performance

**Qué son:** Miden tiempo de carga y respuesta.

**Métricas:**
| Métrica | Objetivo |
|---------|----------|
| Carga inicial (First Contentful Paint) | < 2s |
| Listar productos | < 1s |
| Búsqueda de productos | < 500ms |
| Crear acuerdo | < 2s |

**Herramientas:** Lighthouse, WebPageTest, Jest benchmark

```javascript
// En tests/e2e/performance.js
test('Listar productos debe ser < 1s', async () => {
  const inicio = Date.now();
  const productos = await listarProductos();
  const duracion = Date.now() - inicio;
  expect(duracion).toBeLessThan(1000);
});
```

---

### 2.7 Pruebas de Seguridad

**Qué se valida:**
- ✅ SQL Injection en búsquedas
- ✅ XSS en inputs de usuario
- ✅ CSRF en cambios de estado
- ✅ Autenticación requerida en rutas protegidas

```javascript
// Test: Ruta protegida sin auth redirige a login
test('GET /mis-productos sin auth redirige a /login', async () => {
  await driver.get(`${BASE_URL}/mis-productos`);
  const url = await driver.getCurrentUrl();
  expect(url).toContain('/login');
});
```

---

### 2.8 Pruebas de Accesibilidad (A11y)

**Qué se valida:**
- ✅ Navegación por teclado (Tab, Enter, Escape)
- ✅ Contrast de colores WCAG AA
- ✅ Labels en inputs
- ✅ ARIA roles correctos

**Herramientas:** axe-core, pa11y

```javascript
// Test: Todos los botones deben ser accesibles por teclado
test('Botones accesibles por Tab', async () => {
  const botones = await driver.findElements(By.css('button'));
  for (const btn of botones) {
    const tabIndex = await btn.getAttribute('tabindex');
    expect(parseInt(tabIndex) >= -1).toBe(true);
  }
});
```

---

## 3. HERRAMIENTAS UTILIZADAS

### 3.1 Testing de Unidades
- **Jest** — Framework principal (configurado en `vite.config.ts`)
- **Vitest** — Alternativa más rápida (compatible con Vite)
- **@testing-library/react** — Renderizar y testear componentes

**Instalación:**
```bash
npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom
```

**Config:** `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { lines: 80, functions: 80, branches: 75 },
  },
};
```

---

### 3.2 Testing de APIs
- **Postman** — Requests HTTP manuales y automatizadas
- **msw (Mock Service Worker)** — Mock de APIs en tests
- **Supertest** — Testing de endpoints (cuando hay backend)

**Ejemplo con MSW:**
```typescript
// tests/api/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/sms', async () => {
    return HttpResponse.json({ codigo: '123456' });
  }),
];
```

---

### 3.3 Testing E2E
- **Selenium WebDriver** — Navegador real, control de browser
- **Cypress** — Mejor DX, dashboard interactivo
- **Playwright** — Más rápido, múltiples navegadores

**Comparación:**

| Herramienta | Velocidad | DX | Costo |
|-------------|-----------|-----|-------|
| Selenium | Lento | Buena | Gratis |
| Cypress | Rápido | Excelente | Gratis + CI premium |
| Playwright | Muy rápido | Muy buena | Gratis |

**Recomendación:** Usar Cypress para desarrollo local, Playwright en CI/CD

---

### 3.4 Testing de Datos (Schemas)
- **Zod** — Validación con runtime checks
- **joi** — Alternativa
- **ajv** — Validación JSON Schema

Ya está integrado en el proyecto: `src/schemas/`

---

### 3.5 Herramientas de Análisis
- **Istanbul / nyc** — Cobertura de código
- **SonarQube** — Análisis estático
- **ESLint** — Linting

**Configuración en package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "node tests/e2e/selenium-login-registro.js",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

---

## 4. PLAN DE IMPLEMENTACIÓN

### 4.1 Fase 1: Tests Unitarios (Semana 1)
- [ ] Setup Jest + React Testing Library
- [ ] Tests para `authApi.ts` (enviarCodigoSMS, verificarCodigoSMS, etc.)
- [ ] Tests para `productosApi.ts` (CRUD)
- [ ] Meta: 80% cobertura en APIs

### 4.2 Fase 2: Tests de Integración (Semana 2)
- [ ] Flujo login → crear sesión
- [ ] Flujo registro → validación DPI → crear usuario
- [ ] Flujo crear acuerdo → descontar stock
- [ ] Meta: Validar interacciones entre módulos

### 4.3 Fase 3: Tests E2E (Semana 3)
- [ ] Setup Selenium WebDriver
- [ ] Tests de login/registro (ya incluidos en script)
- [ ] Tests de catálogo y carrito
- [ ] Tests de acuerdos
- [ ] Meta: 3 flujos principales + regresión

### 4.4 Fase 4: CI/CD (Semana 4)
- [ ] GitHub Actions workflow
- [ ] Ejecutar tests en cada PR
- [ ] Reporte de cobertura
- [ ] Bloquear merge si tests fallan

---

## 5. MATRIZ DE PRUEBAS

| Módulo | Unitarias | Integración | E2E | Performance | Seguridad |
|--------|-----------|------------|-----|-------------|-----------|
| Auth | ✅ | ✅ | ✅ | ✅ | ✅ |
| Productos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Acuerdos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mensajes | ✅ | ✅ | ❌ | ❌ | ✅ |
| Comité | ✅ | ✅ | ❌ | ❌ | ✅ |
| Calificaciones | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 6. CRITERIOS DE ACEPTACIÓN

✅ **Pasar cobertura:** Mínimo 80% en código crítico

✅ **Performance:** Todas las acciones < 3 segundos

✅ **Seguridad:** 0 vulnerabilidades en OWASP Top 10

✅ **Accesibilidad:** Navegación completa por teclado

✅ **Regresión:** 0 tests fallidos en main branch

---

## 7. COMANDOS DE EJECUCIÓN

```bash
# Todas las pruebas
npm test

# Solo unitarias
npm run test:unit

# Solo integración
npm run test:integration

# E2E con Selenium
npm run test:e2e

# Con cobertura
npm run test:coverage

# Watch mode (escuchar cambios)
npm run test:watch

# E2E con Cypress (alternativa)
npm run cypress:open
```

---

## 8. EJEMPLO DE RESULTADO

```
PASS tests/unit/auth.test.ts
  ✓ enviarCodigoSMS retorna código de 6 dígitos (45ms)
  ✓ verificarCodigoSMS rechaza código incorrecto (32ms)
  ✓ registrarUsuario crea usuario con DPI único (58ms)

PASS tests/integration/login.integration.test.ts
  ✓ Flujo login → sesión guardada (120ms)
  ✓ Flujo registro → DPI validado (145ms)

Test Suites: 2 passed, 2 total
Tests: 5 passed, 5 total
Snapshots: 0 total
Time: 2.345s

Coverage:
  Lines: 82.4% ( 98/119 )
  Functions: 85.2% ( 46/54 )
  Branches: 78.9% ( 45/57 )
```

