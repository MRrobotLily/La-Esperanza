# Release Notes - DERCAS La Esperanza

## Version 1.0.0

Fecha de publicacion: Mayo 2026
Equipo de desarrollo: Emersson Alvizures, Julieta Pinto, Dalila Zacarias
Universidad: Mariano Galvez de Guatemala - Analisis de Sistemas I

---

## Funcionalidades incluidas en esta version

### Modulo de Autenticacion
- Registro de usuario con numero de telefono
- Verificacion de identidad mediante captura de DPI
- Inicio de sesion con codigo SMS (simulado en v1.0)
- Cierre de sesion
- Redireccion automatica segun rol

### Modulo de Perfil
- Visualizacion y edicion de perfil personal
- Subida de fotografia de perfil
- Informacion de contacto y direccion

### Modulo de Productos
- Publicacion de productos agricolas con imagenes
- Precios unitarios y por mayor
- Activar, desactivar y eliminar productos

### Modulo de Catalogo
- Catalogo publico visible para visitantes y usuarios
- Filtro por categoria
- Vista detallada de producto con calificaciones

### Modulo de Carrito
- Agregar productos a la lista
- Modificar cantidades
- Eliminar productos
- Resumen con precio estimado total

### Modulo de Mensajeria
- Chat interno entre comprador y productor
- Envio de lista de productos al productor
- Historial de conversaciones

### Modulo de Acuerdos de Compra
- Creacion de acuerdos desde el carrito
- Estados: Pendiente, Aceptado, Rechazado, Cancelado, Finalizado
- Definicion de punto de entrega, fecha y hora

### Modulo de Calificaciones
- Calificacion de 1 a 5 estrellas al productor
- Comentario opcional
- Calificacion promedio visible en perfil del productor

### Modulo de Notificaciones
- Notificaciones de nuevos mensajes
- Notificaciones de cambios en acuerdos
- Notificaciones de solicitudes de compra

### Panel del Comite
- Gestion de usuarios
- Panel de estadisticas del sistema
- Modulo de relaciones entre usuarios
- Registro de auditoria

---

## Limitaciones conocidas en v1.0.0

- Persistencia: Los datos se almacenan en localStorage del navegador
- SMS simulado: El envio de codigo por SMS es simulado
- Sin backend real: No hay servidor Node.js/Express
- Imagenes locales: Las imagenes se manejan localmente
- Sin pagos en linea: Los pagos se realizan de forma presencial
- Sin pruebas automatizadas: Las pruebas de esta version son manuales

---

## Proximas mejoras previstas (v2.0)

- Backend con Node.js + Express
- Base de datos MySQL real
- Autenticacion SMS real con Twilio
- Almacenamiento de imagenes con Cloudinary
- Mensajeria en tiempo real con Socket.io
- Integracion con WhatsApp Business API
- Pruebas automatizadas
- Recuperacion de contrasena
- Despliegue en Railway/Render

---

## Stack tecnologico v1.0.0

Frontend: React 19 + TypeScript
Estilos: Tailwind CSS 3
Build: Vite 6
Routing: React Router 7
Estado: TanStack Query 5
Formularios: React Hook Form + Zod
Persistencia: localStorage
Control de versiones: Git + GitHub

---

Repositorio: https://github.com/MRrobotLily/La-Esperanza
Release tag: v1.0.0
