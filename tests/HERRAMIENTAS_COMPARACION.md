# 🔧 Comparación de Herramientas de Testing

## 1️⃣ SELENIUM WebDriver vs CYPRESS vs PLAYWRIGHT

### Tabla Comparativa

| Característica | Selenium | Cypress | Playwright |
|---|---|---|---|
| **Velocidad** | 🐢 Lenta | 🚀 Rápida | 🚀🚀 Muy rápida |
| **Curva aprendizaje** | 📈 Pronunciada | 📉 Suave | 📉 Suave |
| **Soporte navegadores** | ✅ Todos | ✅ Chrome, Firefox, Edge | ✅ Chrome, Firefox, Safari, Edge |
| **API moderna** | ❌ Antigua | ✅ Modern JS/TS | ✅ Modern JS/TS |
| **Debugging** | ❌ Difícil | ✅ Excelente (UI dashboard) | ✅ Inspector integrado |
| **Grabación de videos** | ❌ Requiere setup | ✅ Automático | ✅ Automático |
| **Reportes** | ❌ Básicos | ✅ Detallados | ✅ HTML reports |
| **CI/CD** | ✅ Funciona | ✅ Excellente | ✅ Excelente |
| **Cloud support** | ✅ BrowserStack | ✅ Cypress Cloud | ✅ Playwright Cloud |
| **Costo** | 🆓 Gratis | 🆓 Gratis (+ premium cloud) | 🆓 Gratis |
| **Mantenimiento** | ⚠️ Antiguo (Selenium 4) | ✅ Activo | ✅ Muy activo |

---

## 2️⃣ JEST vs VITEST (Unit Testing)

| Característica | Jest | Vitest |
|---|---|---|
| **Velocidad** | 🐢 Lenta (cold start) | 🚀 Muy rápida |
| **Config** | ⚙️ Compleja | 🔧 Usa vite.config.ts |
| **TypeScript** | ✅ Sí (con ts-jest) | ✅ Nativo |
| **Snapshots** | ✅ Excelentes | ✅ Excelentes |
| **Cobertura** | ✅ Completa | ✅ Completa |
| **Comunidad** | ✅✅ Grande | ✅ Creciente |
| **Matchers** | ✅ Muchos | ✅ Hereda de Jest |
| **Watch mode** | 🐢 Lento | 🚀 Instantáneo |

**Recomendación:** Para proyecto Vite → usar **Vitest**

---

## 3️⃣ JEST vs REACT TESTING LIBRARY

### Jest
- **Qué es:** Framework de testing (runner + assertions)
- **Para:** Lógica pura, funciones, hooks
- **Ubicación:** `tests/unit/*.test.ts`
- **Ejemplo:**
```typescript
test('suma debe ser correcta', () => {
  expect(1 + 1).toBe(2);
});
```

### React Testing Library
- **Qué es:** Librería para testear componentes React
- **Para:** Componentes, interacciones UI
- **Funciona con:** Jest (o Vitest)
- **Ubicación:** `tests/unit/**/*.test.tsx`
- **Ejemplo:**
```typescript
test('botón debe clickearse', () => {
  render(<Button>Click</Button>);
  fireEvent.click(screen.getByText('Click'));
  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

---

## 4️⃣ POSTMAN vs MSW (API Testing)

### Postman
- **Qué es:** Cliente HTTP visual + colecciones
- **Para:** Testing manual de endpoints, documentación
- **Ventaja:** No requiere código, UI intuitiva
- **Limitación:** No integra bien en tests automáticos
- **Ubicación:** `postman_collection.json`
- **Uso:**
```
1. Crear request GET http://api.local/productos
2. Presionar "Send"
3. Ver respuesta en panel derecha
```

### MSW (Mock Service Worker)
- **Qué es:** Librería para mockear APIs en tests
- **Para:** Testing automático sin backend real
- **Ventaja:** Intercepta requests a nivel network, muy realista
- **Ubicación:** `tests/mocks/handlers.ts`
- **Ejemplo:**
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/productos', () => {
    return HttpResponse.json([{ id: 1, nombre: 'Tomate' }]);
  }),
];
```

---

## 5️⃣ HERRAMIENTAS POR TIPO DE PRUEBA

### Unit Tests
```
✅ Jest / Vitest
✅ React Testing Library (para componentes)
✅ @testing-library/jest-dom
```

### Integration Tests
```
✅ Jest / Vitest
✅ React Testing Library
✅ MSW (para APIs)
✅ @testing-library/user-event
```

### E2E Tests
```
✅ Cypress (recomendado para dev local)
✅ Playwright (recomendado para CI)
✅ Selenium (legacy, no recomendado)
```

### Performance
```
✅ Lighthouse (built-in en Chrome)
✅ WebPageTest
✅ Jest benchmark
```

### Seguridad
```
✅ OWASP ZAP
✅ Burp Suite
✅ Snyk (dependencias)
```

### Accesibilidad
```
✅ axe-core
✅ pa11y
✅ Jest axe
✅ Cypress axe
```

---

## 6️⃣ SETUP RECOMENDADO PARA LA ESPERANZA

```
┌─────────────────────────────────────────┐
│  Nivel 1: Unit Tests (80% coverage)    │
├─────────────────────────────────────────┤
│ Framework: Jest o Vitest                │
│ Assertion: Built-in matchers            │
│ Componentes: React Testing Library       │
│ Mocking APIs: MSW                        │
│ Resultado: `npm run test:unit`          │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  Nivel 2: Integration Tests (60% flow)  │
├─────────────────────────────────────────┤
│ Framework: Jest o Vitest                │
│ Escenarios: Flujos completos            │
│ Validación: Zod schemas                 │
│ Mocking: MSW para APIs                  │
│ Resultado: `npm run test:integration`   │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  Nivel 3: E2E Tests (3 flujos críticos) │
├─────────────────────────────────────────┤
│ Framework: Cypress (local) + Playwright  │
│           (CI/CD)                       │
│ Escenarios: Login, Compra, Registro    │
│ Coverage: Rutas principales             │
│ Resultado: `npm run test:e2e`           │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  Nivel 4: Performance & Security        │
├─────────────────────────────────────────┤
│ Performance: Lighthouse + WebPageTest   │
│ Seguridad: Snyk + OWASP ZAP             │
│ Accesibilidad: axe-core                 │
│ CI/CD: GitHub Actions                   │
└─────────────────────────────────────────┘
```

---

## 7️⃣ INSTALACIÓN POR OPCIÓN

### ✅ Opción A: Selenium (Ya incluida)
```bash
npm install --save-dev selenium-webdriver
# Script: tests/e2e/selenium-login-registro.js
# Ejecutar: npm run test:e2e
```

### ✅ Opción B: Cypress (Recomendado para desarrollo)
```bash
npm install --save-dev cypress
# Ejecutar: npm run test:e2e:cypress
# Ver interface gráfica: npx cypress open
```

### ✅ Opción C: Playwright (Recomendado para CI/CD)
```bash
npm install --save-dev @playwright/test
# Ejecutar: npx playwright test
# UI: npx playwright test --ui
```

### ✅ Opción D: Todos (Completo)
```bash
npm install --save-dev \
  jest vitest ts-jest @types/jest \
  @testing-library/react @testing-library/jest-dom \
  msw \
  cypress \
  @playwright/test \
  axe-core \
  lighthouse
```

---

## 8️⃣ MATRIZ DE DECISIÓN

### Pregunta: ¿Qué herramienta usar?

**¿Unit tests de funciones puras?**
→ Jest o Vitest ✅

**¿Unit tests de componentes React?**
→ Jest/Vitest + React Testing Library ✅

**¿Testing de APIs sin backend?**
→ MSW ✅

**¿Primeras pruebas E2E (local)?**
→ Cypress ✅

**¿E2E robustas en CI/CD?**
→ Playwright ✅

**¿Heredado que debe funcionar?**
→ Selenium (en nuestro proyecto ya está)

**¿Testing API REST real (manual)?**
→ Postman ✅

**¿Performance?**
→ Lighthouse (built-in)

**¿Seguridad?**
→ Snyk (dependencias) + OWASP ZAP (vulnerabilidades)

**¿Accesibilidad?**
→ axe-core + manual review

---

## 9️⃣ PIPELINE RECOMENDADO

```yaml
name: Testing Pipeline

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - npm run lint
    
  unit-tests:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - npm run test:unit -- --coverage
      - upload coverage reports
    
  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - npm run test:integration
    
  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - npm run dev &
      - npm run test:e2e  (Playwright)
      - upload artifacts
    
  security:
    needs: e2e-tests
    runs-on: ubuntu-latest
    steps:
      - snyk security scan
      - npm audit
    
  report:
    needs: [unit-tests, integration-tests, e2e-tests]
    runs-on: ubuntu-latest
    steps:
      - generate report
      - post comment on PR
```

---

## 🔟 REFERENCIAS

- [Jest](https://jestjs.io/)
- [Vitest](https://vitest.dev/)
- [Cypress](https://docs.cypress.io)
- [Playwright](https://playwright.dev)
- [Selenium](https://www.selenium.dev)
- [React Testing Library](https://testing-library.com)
- [MSW](https://mswjs.io)
- [axe-core](https://github.com/dequelabs/axe-core)

---

## RESUMEN FINAL

| Aspecto | Recomendación |
|---|---|
| **Unit Testing** | Vitest (rápido, moderno) |
| **Component Testing** | React Testing Library |
| **API Mocking** | MSW |
| **E2E Local** | Cypress |
| **E2E CI/CD** | Playwright |
| **Cobertura mínima** | 80% |
| **Performance** | Lighthouse + WebPageTest |
| **Seguridad** | Snyk + OWASP ZAP |

