# 🌿 La Esperanza 

Sistema de Gestión y Comercialización Agrícola para la cooperativa DERCAS.

**Universidad Mariano Gálvez de Guatemala**  
Análisis de Sistemas I

---

## 🚀 PROYECTO EN PRODUCCIÓN

- **Frontend**: https://unique-generosity-production-e30b.up.railway.app
- **Backend**: https://la-esperanza-production.up.railway.app
- **Repositorio**: https://github.com/MRrobotLily/La-Esperanza

---

## 👥 EQUIPO

| Rol | Integrante |
|-----|------------|
| **Scrum Master** | Dalila Zacarías (MRrobotLily) |
| **Product Owner** | Emersson Alvizures |
| **Development Team** | Julieta Pinto |

---

## 🎯 FUNCIONALIDADES

### Para Productores 🧑‍🌾
- Publicar productos con fotos, precio unitario y por mayor
- Editar, pausar/activar y eliminar productos
- Recibir solicitudes de compra
- Definir tipo de entrega (recoger/delivery), punto y fecha
- Aceptar o rechazar acuerdos
- Chat con compradores
- Calificar a compradores
- Ver reseñas recibidas en el perfil

### Para Compradores 🛒
- Explorar catálogo con imágenes
- Filtrar por categoría
- Agregar al carrito
- Modificar cantidades (precio unitario y mayor)
- Enviar lista al productor por chat dentro de la app, WhatsApp o PDF
- Confirmar entrega
- Calificar al productor
- Ver historial de compras

### Para el Comité 🏛️
- Gestionar usuarios
- Ver estadísticas
- Supervisar la plataforma

---

## 🛠️ TECNOLOGÍAS

### Frontend
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query (TanStack)** - Estado del servidor
- **React Hook Form + Zod** - Formularios y validación
- **React Router** - Navegación
- **React Hot Toast** - Notificaciones

### Backend
- **Node.js + Express** - Servidor REST API
- **MySQL 9.4** - Base de datos relacional
- **mysql2** - Driver de Node.js
- **CORS** - Cross-origin requests
- **dotenv** - Variables de entorno

### Infraestructura
- **Railway** - Hosting (Frontend, Backend, MySQL)
- **GitHub** - Control de versiones
- **HTTPS** - Certificado SSL automático

---

## 📋 USUARIOS DE PRUEBA

| Rol | Nombre | Teléfono |
|-----|--------|----------|
| Productor | Juan Pérez | `5512-3456` |
| Comprador | María López | `5598-7654` |
| Comité | Carlos García | `5500-0001` |
| Productor | Ana Rodríguez | `5555-1111` |
| Comprador | Luis Martínez | `5555-2222` |

**Código SMS demo**: `123456` (universal para todos)

---

## 🏃 EJECUCIÓN LOCAL

### Requisitos
- Node.js 20+
- MySQL 8.0+ instalado localmente
- npm o yarn
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/MRrobotLily/La-Esperanza.git
cd La-Esperanza/web-react-ts
```

### 2. Configurar la base de datos
Conéctate a MySQL y ejecuta:

```sql
CREATE DATABASE la_esperanza;
USE la_esperanza;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telefono VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  dpi VARCHAR(13),
  direccion VARCHAR(255),
  departamento VARCHAR(100),
  municipio VARCHAR(100),
  foto_perfil LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  categoria VARCHAR(100),
  precio DECIMAL(10,2),
  stock INT DEFAULT 0,
  descripcion TEXT,
  user_id INT,
  precio_mayor DECIMAL(10,2) DEFAULT 0,
  cantidad_mayor INT DEFAULT 10,
  unidad_medida VARCHAR(50) DEFAULT 'lb',
  imagenes LONGTEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE carrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE acuerdos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comprador_id INT NOT NULL,
  productor_id INT NOT NULL,
  items TEXT,
  canal_contacto VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'pendiente',
  confirmado_comprador BOOLEAN DEFAULT FALSE,
  confirmado_productor BOOLEAN DEFAULT FALSE,
  entrega_tipo VARCHAR(50),
  entrega_punto VARCHAR(255),
  entrega_fecha VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  remitente_id INT NOT NULL,
  destinatario_id INT NOT NULL,
  acuerdo_id INT,
  texto TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acuerdo_id INT NOT NULL,
  emisor_id INT NOT NULL,
  receptor_id INT NOT NULL,
  estrellas INT NOT NULL,
  comentario TEXT,
  direccion VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba
INSERT INTO users (telefono, nombre, apellido, rol) VALUES
('5512-3456', 'Juan', 'Pérez', 'productor'),
('5598-7654', 'María', 'López', 'comprador'),
('5500-0001', 'Carlos', 'García', 'comite'),
('5555-1111', 'Ana', 'Rodríguez', 'productor'),
('5555-2222', 'Luis', 'Martínez', 'comprador');
```

### 3. Configurar variables de entorno del backend

Crea archivo `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=la_esperanza
PORT=3001
```

### 4. Instalar dependencias y ejecutar Backend

```bash
cd backend
npm install
node server.js
```

El backend correrá en `http://localhost:3001`

### 5. Configurar variables de entorno del Frontend

Edita el archivo `src/api/productosApi.ts` y otros archivos en `src/api/` cambiando:

```typescript
const BACKEND_URL = 'http://localhost:3001/api';
```

### 6. Instalar dependencias y ejecutar Frontend

En otra terminal:

```bash
cd web-react-ts
npm install
npm run dev
```

El frontend correrá en `http://localhost:5173`

---

## 🌐 DESPLIEGUE EN RAILWAY

### Variables de entorno necesarias:

```env
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=*********
DB_NAME=railway
PORT=3001
```

### Pasos:
1. Crear cuenta en [Railway](https://railway.com)
2. Crear nuevo proyecto
3. Agregar servicio MySQL
4. Agregar servicio del repo GitHub para el backend (root: `web-react-ts/backend`)
5. Agregar servicio del repo GitHub para el frontend (root: `web-react-ts`)
6. Configurar variables de entorno
7. Generar dominios públicos para ambos servicios

---

## 📂 ESTRUCTURA DEL PROYECTO

```
web-react-ts/
├── backend/
│   ├── server.js              # Servidor Express
│   ├── package.json
│   └── .env                   # Variables de entorno
├── src/
│   ├── api/                   # APIs (capa de datos)
│   │   ├── authApi.ts
│   │   ├── productosApi.ts
│   │   ├── carritoApi.ts
│   │   ├── acuerdosApi.ts
│   │   ├── mensajesApi.ts
│   │   ├── calificacionesApi.ts
│   │   ├── notificacionesApi.ts
│   │   └── comiteApi.ts
│   ├── components/            # Componentes reutilizables
│   ├── screens/               # Pantallas/páginas
│   │   ├── Login/
│   │   ├── Registro/
│   │   ├── Catalogo/
│   │   ├── Carrito/
│   │   ├── Perfil/
│   │   ├── Acuerdos/
│   │   ├── AcuerdoDetalle/
│   │   ├── Chat/
│   │   ├── MisProductos/
│   │   └── ProductoForm/
│   ├── providers/             # Context Providers
│   ├── schemas/               # Validaciones Zod
│   ├── types/                 # TypeScript types
│   └── utils/                 # Funciones utilitarias
├── public/                    # Assets estáticos
├── Dockerfile                 # Para Railway frontend
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎨 PATRONES DE DISEÑO APLICADOS

### 1. MVC (Modelo-Vista-Controlador)
- **Modelo**: `src/api/` - Acceso a datos
- **Vista**: `src/screens/` y `src/components/` - UI
- **Controlador**: `hooks/useXXX.ts` - Lógica de negocio

### 2. Repository Pattern
Cada archivo en `src/api/` actúa como repositorio para una entidad específica.

### 3. Observer Pattern
React Query maneja suscripciones automáticas a cambios de datos.

### 4. Singleton
`AuthProvider` mantiene una única instancia de sesión.

### 5. Facade Pattern
Hooks personalizados (`useCarrito`, `useProductoForm`) ocultan complejidad.

### 6. Strategy Pattern
Diferentes estrategias de visualización y comportamiento según rol del usuario.

---

## 🔐 SEGURIDAD

- ✅ HTTPS automático en Railway
- ✅ Prepared Statements (previene SQL Injection)
- ✅ Validación de datos con Zod
- ✅ CORS configurado
- ✅ Variables de entorno para credenciales

---

## 📊 ENDPOINTS DEL BACKEND

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener un producto
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Carrito
- `GET /api/carrito/:userId` - Ver carrito
- `POST /api/carrito` - Agregar/modificar item
- `DELETE /api/carrito/:userId/:productoId` - Eliminar item
- `DELETE /api/carrito/:userId` - Vaciar carrito

### Acuerdos
- `GET /api/acuerdos` - Listar acuerdos
- `POST /api/acuerdos` - Crear acuerdo
- `PUT /api/acuerdos/:id` - Actualizar estado/confirmaciones

### Mensajes
- `GET /api/mensajes` - Listar mensajes
- `POST /api/mensajes` - Enviar mensaje

### Calificaciones
- `GET /api/calificaciones` - Listar calificaciones
- `POST /api/calificaciones` - Crear calificación

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener un usuario
- `PUT /api/users/:id` - Actualizar perfil

### Health Check
- `GET /health` - Estado del servidor

---

## 🐛 DEBUGGING

### Probar el backend
```bash
curl https://la-esperanza-production.up.railway.app/health
```

### Probar login
```bash
curl -X POST https://la-esperanza-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"telefono":"5512-3456"}'
```

### Limpiar localStorage (en navegador F12 → Console)
```javascript
localStorage.clear()
```

---

## 📝 LICENCIA

Proyecto académico - Universidad Mariano Gálvez de Guatemala  
Análisis de Sistemas I - 2026

---

## 🎓 CONTACTO

- **GitHub**: [@MRrobotLily](https://github.com/MRrobotLily)
- **Proyecto**: https://github.com/MRrobotLily/La-Esperanza
