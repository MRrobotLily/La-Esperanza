# La Esperanza

Aplicación web de comercio local desarrollada con React + TypeScript + Vite.

## Descripción

La Esperanza es un proyecto de mercado digital que incluye:
- autenticación y registro de usuarios con validación de teléfono y DPI,
- gestión de productos y búsquedas,
- carrito de compras con cálculo de precios y stock,
- acuerdos comerciales entre comprador y productor,
- sistema de calificaciones y reputación,
- administración de usuarios por comité,
- pruebas unitarias para APIs de la aplicación.

## Tecnologías principales

- React 19
- TypeScript
- Vite
- Jest
- Zod
- React Router
- React Query

## Estructura del proyecto

- `src/` - código fuente principal
- `src/api/` - lógica de negocio simulada (localStorage)
- `src/components/` - componentes UI reutilizables
- `src/screens/` - pantallas y flujos de la aplicación
- `tests/` - documentación y archivos de prueba
- `tests/unit/` - pruebas unitarias con Jest
- `docs/` - documentación de release y trazabilidad

## Configuración y ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar la aplicación en modo desarrollo

```bash
npm run dev
```

### 3. Construir para producción

```bash
npm run build
```

## Pruebas

### Ejecutar todos los tests

```bash
npm test
```

### Ejecutar pruebas unitarias

```bash
npm run test:unit
```

### Ejecutar cobertura de pruebas

```bash
npm run test:coverage
```

### Modo watch

```bash
npm run test:watch
```

## Documentación de pruebas

- `tests/CASOS_DE_PRUEBA.md` - casos de prueba definidos para los flujos principales.
- `tests/ESTRATEGIA_PRUEBAS.md` - estrategia de pruebas, tipos y criterios.
- `tests/HERRAMIENTAS_COMPARACION.md` - comparación de herramientas de testing.
- `docs/RELEASE_NOTES_Y_TRAZABILIDAD.md` - release notes y matriz de trazabilidad.

## Cobertura actual

La configuración de Jest ya incluye cobertura para el código bajo `src/` y reportes automáticos de cobertura.

## Observaciones

- El backend está actualmente simulado con `localStorage`.
- Los datos se persisten localmente y no se integra una API remota real.
- Se recomienda agregar CI/CD posterior para ejecutar tests y generar reportes automáticamente.

## Próximas mejoras

- Integrar pipeline CI/CD con GitHub Actions.
- Añadir pruebas de integración completas.
- Implementar pruebas E2E con Playwright o Cypress.
- Migrar persistencia a un backend real o base de datos.

---

Este README principal resume el estado actual del proyecto y facilita el inicio rápido para desarrollo y pruebas.
