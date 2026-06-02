/**
 * Cypress E2E Tests — Login y Registro
 * Ubicación: tests/e2e/cypress/e2e/
 * Ejecutar: npm run test:e2e:cypress
 */

describe('🔐 Flujo de Login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  });

  it('debe cargar la página de login', () => {
    cy.contains('h1', /ingresar|login/i).should('be.visible');
    cy.get('input[type="tel"]').should('exist');
  });

  it('debe mostrar error sin teléfono válido', () => {
    cy.get('button').contains(/enviar|siguiente/i).should('be.disabled');
  });

  it('debe habilitar botón con teléfono válido', () => {
    cy.get('input[type="tel"]')
      .type('34567890', { delay: 50 });
    
    cy.get('button').contains(/enviar|siguiente/i)
      .should('not.be.disabled');
  });

  it('debe mostrar error al enviar SMS (demo)', () => {
    cy.get('input[type="tel"]').type('99999999');
    cy.get('button').contains(/enviar/i).click();

    // Esperar notificación de error
    cy.get('.toast, [role="alert"]')
      .should('contain', /error|no se pudo/i);
  });

  it('debe avanzar al paso de código tras enviar SMS', () => {
    cy.get('input[type="tel"]').type('34567890');
    cy.get('button').contains(/enviar|código/i).click();

    // Esperar input de código
    cy.get('input[placeholder*="código"]', { timeout: 5000 })
      .should('be.visible');
  });

  it('debe mostrar error con código incorrecto', () => {
    cy.get('input[type="tel"]').type('34567890');
    cy.get('button').contains(/enviar/i).click();

    cy.get('input[placeholder*="código"]')
      .type('000000');
    
    cy.get('button').contains(/verificar|siguiente/i).click();

    cy.get('.toast, [role="alert"]')
      .should('contain', /incorrecto|código/i);
  });

  it('debe bloquear después de 3 intentos fallidos', () => {
    cy.get('input[type="tel"]').type('34567890');
    cy.get('button').contains(/enviar/i).click();

    // Intento 1
    cy.get('input[placeholder*="código"]').type('111111');
    cy.get('button').contains(/verificar/i).click();

    cy.get('.toast').should('contain', /intento/i);

    // Intento 2
    cy.get('input[placeholder*="código"]').clear().type('222222');
    cy.get('button').contains(/verificar/i).click();

    // Intento 3
    cy.get('input[placeholder*="código"]').clear().type('333333');
    cy.get('button').contains(/verificar/i).click();

    cy.get('.toast')
      .should('contain', /bloqueado|intentos/i);
  });
});

// ============================================================================

describe('📝 Flujo de Registro', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/registro');
    cy.window().then(win => {
      // Espiar localStorage para ver el código
      cy.spy(win.localStorage, 'getItem');
    });
  });

  it('debe cargar formulario de registro', () => {
    cy.get('input[type="tel"]').should('exist');
    cy.contains(/registro|crear cuenta/i).should('be.visible');
  });

  it('debe validar formato de teléfono', () => {
    cy.get('input[type="tel"]').type('abc');
    cy.get('input[type="tel"]').should('have.value', '');

    cy.get('input[type="tel"]').type('34567890');
    cy.get('input[type="tel"]').should('have.value', '34567890');
  });

  it('debe ir a paso 2: Código SMS', () => {
    cy.get('input[type="tel"]').type('34567890');
    cy.get('button').contains(/enviar|siguiente/i).click();

    cy.get('input[placeholder*="código"]')
      .should('be.visible');

    cy.contains(/ingresa el código/i).should('be.visible');
  });

  it('debe ir a paso 3: Validar DPI', () => {
    // Simular avance (en escenario real)
    cy.visit('http://localhost:5173/registro?paso=dpi');

    cy.get('input[placeholder*="DPI"]').should('exist');
    cy.contains(/dpi|cédula/i).should('be.visible');
  });

  it('debe validar DPI con 13 dígitos', () => {
    cy.visit('http://localhost:5173/registro?paso=dpi');

    cy.get('input[placeholder*="DPI"]').type('12345');
    cy.get('button').contains(/siguiente|validar/i)
      .should('be.disabled');

    cy.get('input[placeholder*="DPI"]').clear().type('1234567890123');
    cy.get('button').contains(/siguiente|validar/i)
      .should('not.be.disabled');
  });

  it('debe rechazar DPI duplicado', () => {
    cy.visit('http://localhost:5173/registro?paso=dpi');

    // DPI ya registrado en data demo
    cy.get('input[placeholder*="DPI"]').type('1234567890123');
    cy.get('button').contains(/validar/i).click();

    cy.get('.toast, [role="alert"]')
      .should('contain', /ya existe|duplicado/i);
  });

  it('debe mostrar paso 4: Completa tu perfil', () => {
    cy.visit('http://localhost:5173/registro?paso=perfil');

    cy.get('input[placeholder*="nombre"]').should('exist');
    cy.get('input[placeholder*="apellido"]').should('exist');
    cy.get('select').should('exist'); // rol selector
  });

  it('debe crear cuenta completando perfil', () => {
    cy.visit('http://localhost:5173/registro?paso=perfil');

    cy.get('input[placeholder*="nombre"]').type('Juan');
    cy.get('input[placeholder*="apellido"]').type('Pérez');
    cy.get('select').select('comprador');

    cy.get('button').contains(/registrarse|crear/i).click();

    cy.get('.toast')
      .should('contain', /bienvenido|cuenta creada/i);

    // Debe redirigir a home
    cy.url().should('include', '/');
  });
});

// ============================================================================

describe('🛒 Catálogo de Productos', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/catalogo');
  });

  it('debe listar productos', () => {
    cy.get('[class*="ProductoCard"], .product-card')
      .should('have.length.greaterThan', 0);
  });

  it('debe filtrar por categoría', () => {
    cy.get('select, [role="combobox"]').first().click();
    cy.contains(/verduras|frutas/i).click();

    cy.get('[class*="ProductoCard"]')
      .each($card => {
        cy.wrap($card)
          .should('contain', /verdura|fruta/i);
      });
  });

  it('debe buscar producto', () => {
    cy.get('input[placeholder*="busca"]').type('tomate');

    cy.get('[class*="ProductoCard"]', { timeout: 1000 })
      .should('contain', /tomate/i);
  });

  it('debe mostrar detalles al clickear producto', () => {
    cy.get('[class*="ProductoCard"]').first().click();

    cy.get('h1, h2').should('be.visible');
    cy.contains('Descripción').should('be.visible');
    cy.contains(/precio|Q/i).should('be.visible');
  });
});

// ============================================================================

describe('🛍️ Carrito de Compras', () => {
  beforeEach(() => {
    cy.login('34567890', '123456');
    cy.visit('http://localhost:5173/catalogo');
  });

  it('debe agregar producto al carrito', () => {
    cy.get('[class*="ProductoCard"]').first()
      .within(() => {
        cy.get('button').contains(/agregar|carrito/i).click();
      });

    cy.get('.toast')
      .should('contain', /agregado|carrito/i);

    cy.get('[data-testid="carrito-count"]')
      .should('contain', '1');
  });

  it('debe ir al carrito y ver items', () => {
    // Agregar producto
    cy.get('[class*="ProductoCard"]').first()
      .within(() => {
        cy.get('button').contains(/agregar/i).click();
      });

    // Ir a carrito
    cy.get('a, button').contains(/carrito/i).click();

    cy.get('[class*="ItemCarrito"], .cart-item')
      .should('have.length.greaterThan', 0);
  });

  it('debe actualizar cantidad en carrito', () => {
    cy.visit('http://localhost:5173/carrito');

    cy.get('input[type="number"]').first()
      .clear().type('5');

    cy.get('button').contains(/actualizar|guardar/i).click();

    cy.get('.toast')
      .should('contain', /actualizado/i);
  });

  it('debe eliminar item del carrito', () => {
    cy.visit('http://localhost:5173/carrito');

    const itemCount = cy.get('[class*="ItemCarrito"]').then(
      $items => $items.length
    );

    cy.get('button').contains(/eliminar|quitar/i).first().click();

    cy.get('[class*="ItemCarrito"]')
      .should('have.length.lessThan', itemCount);
  });

  it('debe vaciar carrito completo', () => {
    cy.visit('http://localhost:5173/carrito');

    cy.get('button').contains(/vaciar/i).click();

    cy.get('[class*="VacioEstado"], .empty')
      .should('be.visible');
  });
});

// ============================================================================

describe('📊 Performance', () => {
  it('debe cargar página principal en < 3 segundos', () => {
    cy.visit('http://localhost:5173', { onBeforeLoad: start });

    cy.then(() => {
      const duration = Date.now() - start;
      expect(duration).to.be.lessThan(3000);
      cy.log(`⏱️ Cargó en ${duration}ms`);
    });
  });

  it('debe buscar productos en < 500ms', () => {
    cy.visit('http://localhost:5173/catalogo');

    cy.get('input[placeholder*="busca"]').type('tomate', 
      { delay: 0 }
    );

    cy.get('[class*="ProductoCard"]', { timeout: 500 })
      .should('exist');
  });
});

// ============================================================================

describe('♿ Accesibilidad', () => {
  it('debe navegar por teclado en login', () => {
    cy.visit('http://localhost:5173/login');

    cy.get('input[type="tel"]').focus();
    cy.focused().should('have.attr', 'type', 'tel');

    cy.focused().type('34567890');
    cy.key('Tab');

    cy.focused().should('have.text', /enviar|siguiente/i);
  });

  it('debe cerrar modal con Escape', () => {
    cy.visit('http://localhost:5173/catalogo');

    cy.get('[class*="ProductoCard"]').first().click();
    cy.get('[role="dialog"]').should('be.visible');

    cy.key('Escape');
    cy.get('[role="dialog"]').should('not.be.visible');
  });

  it('debe tener contrast WCAG AA', () => {
    // Usando plugin de accessibility
    cy.visit('http://localhost:5173');
    cy.checkA11y();
  });
});

// ============================================================================

// Comandos personalizados (en cypress/support/commands.ts)
Cypress.Commands.add('login', (telefono, codigo) => {
  cy.visit('http://localhost:5173/login');
  cy.get('input[type="tel"]').type(telefono);
  cy.get('button').contains(/enviar/i).click();
  cy.get('input[placeholder*="código"]').type(codigo);
  cy.get('button').contains(/verificar/i).click();
});

Cypress.Commands.add('key', (key) => {
  cy.focused().type(`{${key}}`);
});
