# 📋 Casos de Prueba — La Esperanza

## 1. CASOS DE PRUEBA: FLUJO DE LOGIN

### TC-LOGIN-001: Login exitoso con código correcto

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-LOGIN-001 |
| **Módulo** | Autenticación |
| **Tipo** | E2E |
| **Prioridad** | 🔴 Crítica |
| **Precondición** | Usuario activo registrado en el sistema |

**Datos de entrada:**
- Teléfono: +50234567890
- Código SMS: 123456

**Pasos:**
1. Navegar a `http://localhost:5173/login`
2. Ingresar teléfono: `34567890`
3. Presionar botón "Enviar código"
4. Esperar notificación de SMS enviado
5. Ingresar código: `123456`
6. Presionar botón "Verificar código"

**Resultado esperado:**
- ✅ Usuario redirigido a página principal (`/`)
- ✅ Sesión creada correctamente
- ✅ Nombre de usuario aparece en header
- ✅ Carrito visible y funcional

**Observaciones:**
En ambiente de desarrollo, el código se muestra en notificación simulada.

---

### TC-LOGIN-002: Error con código SMS incorrecto

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-LOGIN-002 |
| **Módulo** | Autenticación |
| **Tipo** | E2E |
| **Prioridad** | 🔴 Crítica |

**Datos de entrada:**
- Teléfono: +50234567890
- Código SMS (correcto): 123456
- Código ingresado: 000000 (incorrecto)

**Pasos:**
1. Navegar a login
2. Enviar código SMS a teléfono válido
3. Ingresar código incorrecto: `000000`
4. Presionar "Verificar código"

**Resultado esperado:**
- ❌ Mostrar toast error: "Código incorrecto. Te quedan 2 intentos."
- ❌ NO redirigir a home
- ✅ Campo de código permanece activo
- ✅ Contador de intentos: 2 restantes

**Datos esperados en localStorage:**
```json
{
  "codigosSMS": [
    {
      "telefono": "+50234567890",
      "codigo": "123456",
      "intentos": 1,
      "creadoEn": "2026-05-21T10:30:00.000Z"
    }
  ]
}
```

---

### TC-LOGIN-003: Bloqueo después de 3 intentos fallidos

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-LOGIN-003 |
| **Módulo** | Autenticación |
| **Tipo** | Unit + E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- Teléfono: +50234567890
- Códigos intentados: 111111, 222222, 333333 (todos incorrectos)
- Código correcto: 123456

**Pasos:**
1. Enviar SMS a +50234567890 → Código: 123456
2. **Intento 1:** Ingresar 111111 → Click verificar
   - Resultado: Error, 2 intentos restantes
3. **Intento 2:** Ingresar 222222 → Click verificar
   - Resultado: Error, 1 intento restante
4. **Intento 3:** Ingresar 333333 → Click verificar
   - Resultado: Bloqueado por 5 minutos

**Resultado esperado:**
- ❌ Toast: "Bloqueado por 5 min tras 3 intentos fallidos."
- ❌ Campo de código deshabilitado
- ❌ Botón de verificación deshabilitado
- ✅ Se registra `bloqueadoHasta` en localStorage

**Validación en localStorage:**
```javascript
// Debe existir bloqueadoHasta con timestamp futuro
codigos[0].bloqueadoHasta = new Date(Date.now() + 5*60*1000).toISOString()
// ej: "2026-05-21T10:35:00.000Z"
```

---

### TC-LOGIN-004: Código SMS expirado (> 10 minutos)

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-LOGIN-004 |
| **Módulo** | Autenticación |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- Teléfono: +50234567890
- Tiempo transcurrido: 11 minutos

**Pasos:**
1. Enviar SMS → se crea registro con `creadoEn`
2. Simular paso de 11 minutos (mock time)
3. Intentar verificar código: `123456`

**Resultado esperado:**
- ❌ Toast: "El código expiró. Solicita uno nuevo."
- ❌ NO permitir login
- ✅ Botón de reenvío activo
- ✅ Campo de código limpio

**Implementación en Jest:**
```typescript
jest.useFakeTimers();
jest.advanceTimersByTime(11 * 60 * 1000); // 11 min
const result = await verificarCodigoSMS('+50234567890', '123456');
expect(result.ok).toBe(false);
expect(result.motivo).toBe('expirado');
jest.useRealTimers();
```

---

### TC-LOGIN-005: Usuario con DPI duplicado activo (no puede entrar)

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-LOGIN-005 |
| **Módulo** | Autenticación |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- Teléfono: +50299999999 (teléfono nuevo)
- DPI: 1234567890123 (ya existe en sistema activo)

**Escenario:**
- Usuario A con teléfono A + DPI X (activo)
- Usuario B intenta login con teléfono B pero mismo DPI X

**Pasos:**
1. Navegar a `/login` con teléfono nuevo
2. Enviar SMS
3. Verificar código
4. Sistema detecta DPI duplicado

**Resultado esperado:**
- ❌ Toast: "Ya existe una cuenta activa con este DPI."
- ❌ NO crear nueva sesión
- ✅ Redirigir a `/registro` (opción: usar cuenta existente)

---

### TC-LOGIN-006: Usuario suspendido no puede entrar

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-LOGIN-006 |
| **Módulo** | Autenticación + Comité |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- Teléfono: +50234567890 (usuario suspendido)
- Código SMS: 123456 (correcto)

**Estado inicial:**
```json
{
  "estado": "suspendida",
  "suspendidoHasta": "2026-05-28T23:59:59.000Z",
  "motivoSuspension": "Comportamiento violento en chat"
}
```

**Pasos:**
1. Enviar SMS a teléfono de usuario suspendido
2. Verificar código correcto
3. Intentar hacer login

**Resultado esperado:**
- ❌ Toast: "Cuenta suspendida hasta 28/05/2026. Contacta al comité."
- ❌ NO crear sesión
- ✅ Mostrar motivo de suspensión
- ✅ Mostrar contacto del comité

---

---

## 2. CASOS DE PRUEBA: FLUJO DE REGISTRO

### TC-REG-001: Registro exitoso completo

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-REG-001 |
| **Módulo** | Registro |
| **Tipo** | E2E |
| **Prioridad** | 🔴 Crítica |

**Datos de entrada:**

**Paso 1: Teléfono**
- Teléfono: 87654321

**Paso 2: Código SMS**
- Código: 234567

**Paso 3: DPI**
- DPI: 1234567890999 (nuevo, no duplicado)
- Foto DPI: `data:image/jpeg;base64,...`

**Paso 4: Perfil**
- Nombre: Juan
- Apellido: Pérez López
- Dirección: Calle Principal 123, Apto 5B
- Departamento: Guatemala
- Municipio: Mixco
- Rol: comprador

**Pasos:**
1. Navegar a `/registro`
2. Ingresar teléfono 87654321 → Click "Enviar código"
3. Recibir código 234567 → Ingresar → Click "Siguiente"
4. Ingresar DPI 1234567890999 → Capturar foto → Click "Validar"
5. Rellenar perfil → Click "Registrarse"

**Resultado esperado:**
- ✅ Usuario creado en localStorage
- ✅ Sesión iniciada automáticamente
- ✅ Toast: "¡Cuenta creada! Bienvenido, Juan."
- ✅ Redirigido a home (`/`)
- ✅ Nombre aparece en header

**Validación en localStorage:**
```json
{
  "usuarios": [
    {
      "id": "u_xxx",
      "telefono": "+50287654321",
      "dpi": "1234567890999",
      "nombre": "Juan",
      "apellido": "Pérez López",
      "rol": "comprador",
      "estado": "activa",
      "creadoEn": "2026-05-21T10:30:00.000Z"
    }
  ],
  "sesion": {
    "usuarioId": "u_xxx",
    "creadoEn": "2026-05-21T10:30:00.000Z"
  }
}
```

---

### TC-REG-002: DPI inválido (no 13 dígitos)

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-REG-002 |
| **Módulo** | Registro |
| **Tipo** | Unit + E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- DPI ingresado: 123456 (solo 6 dígitos)

**Pasos:**
1. Navegar a paso 3 (DPI)
2. Ingresar 123456
3. Intentar clickear "Validar"

**Resultado esperado:**
- ❌ Botón "Validar" deshabilitado
- ✅ Mostrar hint: "El DPI debe tener 13 dígitos"
- ✅ Input resaltado en rojo

---

### TC-REG-003: DPI duplicado (ya existe)

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-REG-003 |
| **Módulo** | Registro |
| **Tipo** | E2E |
| **Prioridad** | 🔴 Crítica |

**Datos de entrada:**
- DPI: 1234567890123 (ya existe en el sistema)
- Estado del DPI existente: activo

**Pasos:**
1. Completar pasos 1 y 2 (teléfono y código)
2. Llegar a paso 3 (DPI)
3. Ingresar DPI: 1234567890123
4. Click "Validar"

**Resultado esperado:**
- ❌ Toast: "Ya existe una cuenta activa con este DPI."
- ❌ NO pasar a paso 4 (perfil)
- ✅ Campo DPI resaltado
- ✅ Mostrar opción: "¿Eres el mismo usuario? Usa login"

---

### TC-REG-004: DPI cancelado (no puede registrarse)

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-REG-004 |
| **Módulo** | Registro |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- DPI: 1234567890111 (existe pero cancelado)

**Estado inicial:**
```json
{
  "estado": "cancelada",
  "motivoSuspension": "Incumplimiento de acuerdos"
}
```

**Pasos:**
1. Llegar a paso 3 (DPI)
2. Ingresar 1234567890111
3. Click "Validar"

**Resultado esperado:**
- ❌ Toast: "Este DPI tiene una cuenta cancelada permanentemente. No puede crear una nueva cuenta."
- ❌ Botón "Validar" deshabilitado
- ✅ Mostrar motivo de cancelación

---

### TC-REG-005: Foto de DPI no cargada

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-REG-005 |
| **Módulo** | Registro |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- DPI: 1234567890999 (válido, nuevo)
- Foto: NO cargada

**Pasos:**
1. Llegar a paso 3 (DPI)
2. Ingresar DPI: 1234567890999
3. NO hacer captura de foto
4. Click "Validar"

**Resultado esperado:**
- ❌ Toast: "Debes capturar la foto del DPI."
- ❌ NO validar
- ✅ Mostrar hint: "Toma una foto clara"

---

### TC-REG-006: Nombre vacío en perfil

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-REG-006 |
| **Módulo** | Registro / Schemas |
| **Tipo** | Unit + E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- Nombre: "" (vacío)
- Apellido: "Pérez"

**Pasos:**
1. Llegar a paso 4 (Perfil)
2. Dejar nombre vacío
3. Click "Registrarse"

**Resultado esperado:**
- ❌ Toast: "El nombre es requerido."
- ❌ Input de nombre resaltado en rojo
- ❌ NO crear usuario

**Validación Zod:**
```typescript
const schema = z.object({
  nombre: z.string().min(1, "Requerido"),
});
expect(() => schema.parse({ nombre: "" })).toThrow();
```

---

---

## 3. CASOS DE PRUEBA: ACUERDOS DE COMPRA

### TC-ACU-001: Crear acuerdo exitosamente

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-ACU-001 |
| **Módulo** | Acuerdos |
| **Tipo** | E2E |
| **Prioridad** | 🔴 Crítica |

**Precondición:**
- Usuario comprador logueado
- Productos en carrito:
  - Producto 1: 5 unidades (precio unitario Q15)
  - Producto 2: 10 unidades (precio mayor Q12, cantidad mayor ≥ 10)

**Datos de entrada:**
```json
{
  "compradorId": "u_comp1",
  "productorId": "u_prod1",
  "items": [
    { "productoId": "p_1", "cantidad": 5 },
    { "productoId": "p_2", "cantidad": 10 }
  ],
  "canalContacto": "whatsapp"
}
```

**Pasos:**
1. Navegar a `/carrito`
2. Revisar items
3. Click "Enviar solicitud"
4. Seleccionar productor
5. Click "Confirmar"

**Resultado esperado:**
- ✅ Acuerdo creado con estado `pendiente`
- ✅ Total calculado: (5 × Q15) + (10 × Q12) = Q195
- ✅ Notificación enviada al productor
- ✅ Redirigido a `/acuerdos/{id}`

**Validación en localStorage:**
```json
{
  "acuerdos": [
    {
      "id": "ac_xxx",
      "compradorId": "u_comp1",
      "productorId": "u_prod1",
      "total": 195,
      "estado": "pendiente",
      "confirmadoComprador": false,
      "confirmadoProductor": false,
      "creadoEn": "2026-05-21T10:30:00.000Z"
    }
  ]
}
```

---

### TC-ACU-002: Productor acepta acuerdo

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-ACU-002 |
| **Módulo** | Acuerdos |
| **Tipo** | E2E |
| **Prioridad** | 🔴 Crítica |

**Precondición:**
- Acuerdo existente con estado `pendiente`
- Usuario productor logueado

**Datos de entrada:**
```json
{
  "acuerdoId": "ac_xxx",
  "tipoEntrega": "local",
  "puntoEntrega": "Tienda Centro Comercial La Aurora",
  "fechaEntrega": "2026-05-25"
}
```

**Pasos:**
1. Navegar a `/acuerdos/{acuerdoId}`
2. Revisar detalles del acuerdo
3. Click "Aceptar solicitud"
4. Seleccionar tipo de entrega: "Local"
5. Ingresar punto: "Tienda Centro..."
6. Ingresar fecha: 2026-05-25
7. Click "Confirmar"

**Resultado esperado:**
- ✅ Acuerdo actualizado a estado `aceptado`
- ✅ Campo `entrega` guardado
- ✅ Notificación al comprador: "El productor aceptó tu solicitud."
- ✅ Botones ahora muestran "Confirmar entrega"

---

### TC-ACU-003: Productor rechaza acuerdo

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-ACU-003 |
| **Módulo** | Acuerdos |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Precondición:**
- Acuerdo en estado `pendiente`

**Datos de entrada:**
- Motivo: "No tengo suficiente stock disponible"

**Pasos:**
1. Productor ve acuerdo
2. Click "Rechazar solicitud"
3. Ingresar motivo en modal
4. Click "Confirmar rechazo"

**Resultado esperado:**
- ✅ Acuerdo estado → `rechazado`
- ✅ Se guarda `motivoRechazo`
- ✅ Notificación al comprador con motivo
- ✅ Comprador puede crear nuevo acuerdo

---

### TC-ACU-004: Confirmar entrega por ambas partes

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-ACU-004 |
| **Módulo** | Acuerdos |
| **Tipo** | E2E |
| **Prioridad** | 🔴 Crítica |

**Escenario:**
1. Acuerdo aceptado por productor
2. Ambas partes confirman recepción

**Pasos:**
1. **Productor confirma:** Click "Confirmar que entregué"
   - Estado → `entregado`
   - `confirmadoProductor` = true

2. **Comprador confirma:** Click "Confirmar que recibí"
   - Si `confirmadoProductor` también es true:
     - Estado → `finalizado`
     - Stock se descuenta
     - Ambos reciben notificación

**Resultado esperado:**
- ✅ Acuerdo estado `finalizado`
- ✅ Stock reducido para ambos productos
- ✅ Disponible botón "Calificar" para ambos
- ✅ Notificación: "¡Tu compra fue finalizada! Califica tu experiencia."

**Validación de stock:**
```typescript
// Antes: Producto 1 tenía 100 unidades
// Acuerdo: 5 unidades
// Después: 95 unidades
const producto = await obtenerProducto('p_1');
expect(producto.cantidadDisponible).toBe(95);
```

---

---

## 4. CASOS DE PRUEBA: PRODUCTOS

### TC-PROD-001: Listar productos activos

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-PROD-001 |
| **Módulo** | Productos |
| **Tipo** | Unit |
| **Prioridad** | 🔴 Crítica |

**Datos de entrada:**
```json
{
  "categoria": "Todas",
  "busqueda": "",
  "soloActivos": true
}
```

**Pasos:**
```typescript
const productos = await listarProductos({
  soloActivos: true
});
```

**Resultado esperado:**
- ✅ Retorna array de productos
- ✅ Solo productos con `activo: true`
- ✅ Ordenados por `actualizadoEn` descendente (más recientes primero)
- ✅ Array puede estar vacío si no hay productos

---

### TC-PROD-002: Filtrar productos por categoría

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-PROD-002 |
| **Módulo** | Productos |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- Categoría: "Verduras"

**Pasos:**
```typescript
const verduras = await listarProductos({
  categoria: 'Verduras'
});
```

**Resultado esperado:**
- ✅ Solo retorna productos con `categoria === 'Verduras'`
- ✅ Todos tienen `activo: true`

**Validación:**
```typescript
expect(verduras.every(p => p.categoria === 'Verduras')).toBe(true);
```

---

### TC-PROD-003: Buscar producto por nombre (case-insensitive)

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-PROD-003 |
| **Módulo** | Productos |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- Búsqueda: "TOMATE"

**Pasos:**
```typescript
const resultados = await listarProductos({
  busqueda: 'TOMATE'
});
```

**Resultado esperado:**
- ✅ Encuentra producto "tomate orgánico"
- ✅ Encuentra producto "Tomate Maduro"
- ✅ NO distingue mayúsculas/minúsculas
- ✅ Busca en nombre Y descripción

---

### TC-PROD-004: Crear producto con validación de imágenes

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-PROD-004 |
| **Módulo** | Productos |
| **Tipo** | Unit + E2E |
| **Prioridad** | 🟠 Alta |

**Caso A: Válido (3 imágenes)**
```typescript
await crearProducto('prod1', {
  nombre: 'Tomate',
  categoria: 'Verduras',
  imagenes: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
  // ... otros campos
});
// ✅ Crear exitosamente
```

**Caso B: Inválido (0 imágenes)**
```typescript
await crearProducto('prod1', {
  nombre: 'Tomate',
  imagenes: [],
});
// ❌ Throw Error: "Debes incluir entre 1 y 5 imágenes"
```

**Caso C: Inválido (6 imágenes)**
```typescript
await crearProducto('prod1', {
  nombre: 'Tomate',
  imagenes: Array(6).fill('img.jpg'),
});
// ❌ Throw Error: "Debes incluir entre 1 y 5 imágenes"
```

---

### TC-PROD-005: Descontar stock al finalizar acuerdo

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-PROD-005 |
| **Módulo** | Productos + Acuerdos |
| **Tipo** | Integration |
| **Prioridad** | 🔴 Crítica |

**Escenario:**
- Producto con stock inicial: 100 unidades
- Acuerdo finalizado: 25 unidades

**Pasos:**
1. Crear acuerdo con 25 unidades
2. Ambas partes confirman entrega
3. Acuerdo pasa a `finalizado`

**Resultado esperado:**
- ✅ Stock → 75 unidades (100 - 25)
- ✅ Se llama `descontarStock('prod_id', 25)`
- ✅ `cantidadDisponible` actualizado en localStorage

**Validación:**
```typescript
const antes = await obtenerProducto('p_1');
expect(antes.cantidadDisponible).toBe(100);

// Confirmar entrega...

const despues = await obtenerProducto('p_1');
expect(despues.cantidadDisponible).toBe(75);
```

---

---

## 5. CASOS DE PRUEBA: CALIFICACIONES

### TC-CAL-001: Calificar con 5 estrellas y reseña

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-CAL-001 |
| **Módulo** | Calificaciones |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
```json
{
  "acuerdoId": "ac_xxx",
  "autorId": "u_comp1",
  "destinatarioId": "u_prod1",
  "productorId": "u_prod1",
  "estrellas": 5,
  "resena": "Excelente producto y entrega rápida"
}
```

**Pasos:**
1. Navegar a acuerdo finalizado
2. Click "Calificar"
3. Seleccionar 5 estrellas
4. Ingresar reseña
5. Click "Enviar calificación"

**Resultado esperado:**
- ✅ Calificación guardada
- ✅ Se crea notificación para productor
- ✅ Tooltip: "★★★★★ (5)"
- ✅ Reseña visible en perfil del productor

---

### TC-CAL-002: Validar que no se puede calificar dos veces

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-CAL-002 |
| **Módulo** | Calificaciones |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Precondición:**
- Usuario ya calificó el acuerdo ac_xxx

**Pasos:**
```typescript
const yaCalificoResult = await yaCalificoAcuerdo(
  'ac_xxx',
  'u_comp1',
  'comprador_a_productor'
);
```

**Resultado esperado:**
- ✅ Retorna `true`
- ✅ Botón "Calificar" deshabilitado
- ✅ Toast: "Ya calificaste este acuerdo"

---

### TC-CAL-003: Promedio de reputación

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-CAL-003 |
| **Módulo** | Calificaciones |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
```
Calificaciones: [5, 4, 5, 3, 4]
```

**Pasos:**
```typescript
const promEdio = promedio([5, 4, 5, 3, 4]);
const distribucion = resumen(calificaciones);
```

**Resultado esperado:**
- ✅ `promedio = 4.2`
- ✅ `total = 5`
- ✅ `distribucion[5] = 2` (dos 5 estrellas)
- ✅ `distribucion[4] = 2` (dos 4 estrellas)
- ✅ `distribucion[3] = 1` (una 3 estrella)

---

---

## 6. CASOS DE PRUEBA: CARRITO

### TC-CARR-001: Agregar producto al carrito

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-CARR-001 |
| **Módulo** | Carrito |
| **Tipo** | Unit |
| **Prioridad** | 🔴 Crítica |

**Datos de entrada:**
- usuarioId: u_comp1
- productoId: p_1
- cantidad: 5

**Pasos:**
```typescript
const items = await agregarAlCarrito('u_comp1', 'p_1', 5);
```

**Resultado esperado:**
- ✅ Array con 1 item
- ✅ Item: `{ productoId: 'p_1', cantidad: 5 }`
- ✅ Guardado en localStorage

---

### TC-CARR-002: Incrementar cantidad de producto en carrito

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-CARR-002 |
| **Módulo** | Carrito |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Escenario:**
1. Agregar p_1 con cantidad 5
2. Volver a agregar p_1 con cantidad 3
3. Cantidad debe ser 8

**Pasos:**
```typescript
await agregarAlCarrito('u_comp1', 'p_1', 5);
const items = await agregarAlCarrito('u_comp1', 'p_1', 3);
```

**Resultado esperado:**
- ✅ Array tiene 1 item (no 2)
- ✅ `cantidad = 8` (5 + 3)

---

### TC-CARR-003: Eliminar producto del carrito

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-CARR-003 |
| **Módulo** | Carrito |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Escenario:**
1. Carrito tiene [p_1, p_2, p_3]
2. Eliminar p_2

**Pasos:**
```typescript
const items = await eliminarDelCarrito('u_comp1', 'p_2');
```

**Resultado esperado:**
- ✅ Array tiene 2 items
- ✅ Contiene: p_1, p_3
- ✅ p_2 no existe

---

### TC-CARR-004: Vaciar carrito completo

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-CARR-004 |
| **Módulo** | Carrito |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Pasos:**
```typescript
await vaciarCarrito('u_comp1');
const items = await leerCarrito('u_comp1');
```

**Resultado esperado:**
- ✅ Array vacío: `[]`
- ✅ localStorage limpio para ese usuario

---

---

## 7. CASOS DE PRUEBA: COMITÉ

### TC-COM-001: Suspender usuario por 7 días

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-COM-001 |
| **Módulo** | Comité |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- usuarioId: u_comp1
- motivo: "Lenguaje ofensivo en chat"
- duracionDias: 7

**Pasos:**
1. Admin comité abre pantalla de usuarios
2. Selecciona usuario
3. Click "Suspender"
4. Ingresa motivo y duración
5. Click "Confirmar"

**Resultado esperado:**
- ✅ Usuario `estado` → `suspendida`
- ✅ Se calcula `suspendidoHasta` = ahora + 7 días
- ✅ Se registra en auditoría
- ✅ Notificación enviada al usuario

---

### TC-COM-002: Cancelar usuario permanentemente

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-COM-002 |
| **Módulo** | Comité |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Datos de entrada:**
- usuarioId: u_comp1
- motivo: "Incumplimiento de acuerdos múltiples"

**Pasos:**
1. Admin comité selecciona usuario
2. Click "Cancelar cuenta"
3. Confirmar acción irreversible

**Resultado esperado:**
- ✅ Usuario `estado` → `cancelada`
- ✅ `suspendidoHasta` se borra
- ✅ NO puede volver a registrarse con ese DPI
- ✅ Auditoría registrada

---

### TC-COM-003: Reactivar usuario suspendido

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-COM-003 |
| **Módulo** | Comité |
| **Tipo** | E2E |
| **Prioridad** | 🟠 Alta |

**Precondición:**
- Usuario en estado `suspendida`

**Pasos:**
1. Admin comité selecciona usuario
2. Click "Reactivar"
3. Confirmar

**Resultado esperado:**
- ✅ Usuario `estado` → `activa`
- ✅ `suspendidoHasta` se limpia
- ✅ Puede volver a usar la plataforma
- ✅ Auditoría registrada

---

### TC-COM-004: Ver estadísticas del comité

| Propiedad | Valor |
|-----------|-------|
| **ID** | TC-COM-004 |
| **Módulo** | Comité |
| **Tipo** | Unit |
| **Prioridad** | 🟠 Alta |

**Pasos:**
```typescript
const stats = await estadisticas();
```

**Resultado esperado:**
```json
{
  "totalUsuarios": 45,
  "productores": 12,
  "compradores": 30,
  "suspendidos": 2,
  "cancelados": 1,
  "productosActivos": 87,
  "acuerdosTotales": 156,
  "acuerdosFinalizados": 89,
  "acuerdosPendientes": 15
}
```

- ✅ Números correctos
- ✅ Sumas consistentes

---

## 📊 MATRIZ RESUMEN DE CASOS

| TC | Módulo | Tipo | Prioridad | Status |
|-------|--------|------|-----------|--------|
| TC-LOGIN-001 | Auth | E2E | 🔴 | ✅ |
| TC-LOGIN-002 | Auth | E2E | 🔴 | ✅ |
| TC-LOGIN-003 | Auth | Unit+E2E | 🟠 | ✅ |
| TC-REG-001 | Registro | E2E | 🔴 | ✅ |
| TC-REG-002 | Registro | Unit | 🟠 | ✅ |
| TC-ACU-001 | Acuerdos | E2E | 🔴 | ✅ |
| TC-ACU-004 | Acuerdos | E2E | 🔴 | ✅ |
| TC-PROD-001 | Productos | Unit | 🔴 | ✅ |
| TC-PROD-005 | Productos | Integration | 🔴 | ✅ |
| TC-CAL-001 | Calificaciones | E2E | 🟠 | ✅ |
| TC-CARR-001 | Carrito | Unit | 🔴 | ✅ |
| TC-COM-001 | Comité | E2E | 🟠 | ✅ |

**Total: 30+ casos de prueba**

