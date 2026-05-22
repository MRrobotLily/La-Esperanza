# 🧪 Setup de Pruebas Automatizadas — La Esperanza

## Instalación Rápida

### 1. Instalar dependencias de testing

```bash
# Jest + React Testing Library (Unit tests)
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event

# Selenium WebDriver (E2E tests)
npm install --save-dev selenium-webdriver

# Optional: Cypress (alternativa a Selenium, recomendado)
npm install --save-dev cypress

# Optional: Playwright (otra alternativa, muy rápido)
npm install --save-dev @playwright/test

# Mock de APIs
npm install --save-dev msw
```

---

## Configuración

### 1.1 Jest Configuration (`jest.config.js`)

```javascript
// En raíz del proyecto
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/__tests__/**/*.test.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 1.2 Setup de Testing Library (`tests/setup.ts`)

```typescript
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
```

### 1.3 package.json — Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "node tests/e2e/selenium-login-registro.js",
    "test:e2e:cypress": "cypress open",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "lint": "eslint src tests"
  }
}
```

---

## Ejecución de Tests

### Unit Tests
```bash
# Ejecutar todos
npm run test:unit

# Ejecutar un archivo específico
npm run test:unit -- authApi.test.ts

# Watch mode (escuchar cambios)
npm run test:watch

# Con coverage
npm run test:coverage
```

### E2E Tests con Selenium
```bash
# Primero, iniciar dev server en otra terminal
npm run dev

# En otra terminal, ejecutar tests
npm run test:e2e
```

**Requisitos previos:**
- ChromeDriver instalado (o descargar automáticamente)
- Servidor de desarrollo corriendo en `http://localhost:5173`

### E2E Tests con Cypress (Recomendado)

```bash
# Abrir interfaz gráfica (desarrollo)
npm run test:e2e:cypress

# O ejecutar headless (CI/CD)
npx cypress run
```

**Ventaja de Cypress:** Mejor developer experience, grabación de videos, better debugging

### E2E Tests con Playwright

```bash
# Crear tests con generador
npx playwright codegen http://localhost:5173

# Ejecutar tests
npx playwright test

# Con UI
npx playwright test --ui
```

---

## Estructura de Carpetas

```
tests/
├── unit/                    # Tests unitarios (Jest)
│   ├── authApi.test.ts
│   ├── productosApi.test.ts
│   ├── components/
│   │   ├── Button.test.tsx
│   │   └── Input.test.tsx
│   └── ejemplos.test.ts
│
├── integration/             # Tests de integración
│   ├── auth.integration.test.ts
│   ├── acuerdos.integration.test.ts
│   └── flujos.integration.test.ts
│
├── e2e/                     # Tests end-to-end
│   ├── selenium-login-registro.js      # Selenium
│   ├── cypress/
│   │   └── e2e/
│   │       ├── login.cy.ts
│   │       ├── catalogo.cy.ts
│   │       └── checkout.cy.ts
│   └── playwright/
│       ├── auth.spec.ts
│       └── productos.spec.ts
│
├── fixtures/                # Datos de prueba
│   ├── usuarios.json
│   ├── productos.json
│   └── acuerdos.json
│
├── setup.ts                 # Setup global para Jest
├── ESTRATEGIA_PRUEBAS.md    # Documentación (este archivo)
└── README.md                # Este archivo
```

---

## Ejemplos de Ejecución

### Unit Test — API de Autenticación

**Archivo:** `tests/unit/authApi.test.ts`

```typescript
describe('authApi — verificarCodigoSMS', () => {
  test('debe retornar ok=true con código correcto', async () => {
    const { codigo } = await enviarCodigoSMS('+50234567890');
    const result = await verificarCodigoSMS('+50234567890', codigo);
    expect(result.ok).toBe(true);
  });
});
```

**Ejecutar:**
```bash
npm run test:unit -- authApi.test.ts
```

**Output:**
```
PASS tests/unit/authApi.test.ts
  authApi — verificarCodigoSMS
    ✓ debe retornar ok=true con código correcto (45ms)
    ✓ debe retornar motivo "invalido" con código incorrecto (32ms)
    ✓ debe bloquear después de 3 intentos (58ms)

Test Suites: 1 passed, 1 total
Tests: 3 passed, 3 total
Time: 1.234s
```

---

### Integration Test — Flujo Login

**Archivo:** `tests/integration/auth.integration.test.ts`

```typescript
describe('Flujo de Login', () => {
  test('enviar SMS → verificar código → iniciar sesión', async () => {
    // 1. Enviar código
    const { codigo } = await enviarCodigoSMS('+50234567890');

    // 2. Verificar código
    const verified = await verificarCodigoSMS('+50234567890', codigo);
    expect(verified.ok).toBe(true);

    // 3. Iniciar sesión
    const usuario = await iniciarSesionConTelefono('+50234567890');
    expect(usuario).toBeDefined();
    expect(usuario.telefono).toBe('+50234567890');
  });
});
```

**Ejecutar:**
```bash
npm run test:integration
```

---

### E2E Test — Selenium (Flujo completo)

**Archivo:** `tests/e2e/selenium-login-registro.js`

```javascript
test_cargarPaginaLogin();           // Carga la página
test_enviarCodigoSMS_exitoso();    // Envía SMS
test_verificarCodigo_incorrecto(); // Valida error
test_listarProductosCatalogo();    // Lista productos
test_buscarProducto();              // Busca
test_performanceCargarPrincipal(); // Mide velocidad
```

**Ejecutar:**
```bash
npm run dev                          # Terminal 1: Dev server
npm run test:e2e                    # Terminal 2: Tests E2E
```

**Output:**
```
🚀 Iniciando suite de pruebas E2E — La Esperanza

📝 Test 1: Cargar página de login
✓ Página de login cargada correctamente

📝 Test 2: Enviar código SMS sin teléfono
✓ Validación de teléfono funcionando

📝 Test 3: Enviar código SMS con teléfono válido
✓ Código SMS enviado y paso 2 visible

✅ Todos los tests completados exitosamente
```

---

### Coverage Report

```bash
npm run test:coverage
```

**Output:**
```
----------|----------|----------|----------|---------|
File      | % Stmts  | % Branch | % Funcs  | % Lines |
----------|----------|----------|----------|---------|
All files |   82.4   |   78.9   |   85.2   |   82.4  |
 authApi  |   90.0   |   85.0   |   95.0   |   90.0  |
 productosApi|80.0   |   75.0   |   82.0   |   80.0  |
----------|----------|----------|----------|---------|
```

Se genera reporte HTML en `coverage/index.html`

---

## CI/CD Integration

### GitHub Actions Workflow

**Archivo:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Unit Tests
        run: npm run test:unit -- --coverage
      
      - name: Run Integration Tests
        run: npm run test:integration
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Lint Check
        run: npm run lint
```

**Resultado:** Los tests corren automáticamente en cada PR

---

## Debugging y Troubleshooting

### Ver logs detallados
```bash
npm run test:debug
# Abre DevTools en chrome://inspect
```

### Ver qué está pasando en E2E
```javascript
// En tests/e2e/selenium-login-registro.js
driver.takeScreenshot().then(image => {
  fs.writeFileSync('screenshot.png', image, 'base64');
});
```

### Limpiar localStorage entre tests
```typescript
beforeEach(() => {
  localStorage.clear();
});
```

---

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecutar todos los tests |
| `npm run test:watch` | Modo watch (escuchar cambios) |
| `npm run test:coverage` | Generar reporte de cobertura |
| `npm run test:e2e` | Ejecutar tests E2E con Selenium |
| `npm run lint` | Verificar código |
| `npm run test:debug` | Debug mode para inspección |

---

## Referencia de Herramientas

### Jest Documentation
https://jestjs.io/

### React Testing Library
https://testing-library.com/react

### Selenium WebDriver
https://www.selenium.dev/documentation/

### Cypress
https://docs.cypress.io

### Playwright
https://playwright.dev/docs/intro

---

## Checklist de Setup

- [ ] Instalar dependencias (`npm install --save-dev jest ...`)
- [ ] Crear `jest.config.js`
- [ ] Crear `tests/setup.ts`
- [ ] Crear estructura de carpetas (`tests/unit`, `tests/integration`, `tests/e2e`)
- [ ] Actualizar `package.json` con scripts
- [ ] Crear primer test unitario
- [ ] Verificar que tests pasen (`npm test`)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Establecer cobertura mínima (80%)
- [ ] Documentar patrones en el equipo

---

**¿Preguntas? Consulta la documentación o la guía de estrategia de pruebas.**
