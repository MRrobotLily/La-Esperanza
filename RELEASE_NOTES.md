\# Release Notes — La Esperanza



\## Versión 1.0.0

\*\*Fecha de publicación:\*\* Mayo 2026

\*\*Equipo de desarrollo:\*\* Emersson Alvizures, Julieta Pinto, Dalila Zacarías

\*\*Universidad:\*\* Mariano Gálvez de Guatemala — Análisis de Sistemas I



\---



\## Funcionalidades incluidas en esta versión



\### Módulo de Autenticación

\- Registro de usuario con número de teléfono

\- Verificación de identidad mediante captura de DPI

\- Inicio de sesión con código SMS (simulado en v1.0)

\- Cierre de sesión

\- Redirección automática según rol (Productor, Comprador, Comité)



\### Módulo de Perfil

\- Visualización y edición de perfil personal

\- Subida de fotografía de perfil

\- Información de contacto y dirección



\### Módulo de Productos

\- Publicación de productos agrícolas con imágenes

\- Precios unitarios y por mayor

\- Activar, desactivar y eliminar productos

\- Vista "Mis Productos" para el productor



\### Módulo de Catálogo

\- Catálogo público visible para visitantes y usuarios

\- Filtro por categoría

\- Vista detallada de producto con calificaciones del vendedor



\### Módulo de Carrito (Lista de Interés)

\- Agregar productos a la lista

\- Modificar cantidades

\- Eliminar productos

\- Resumen con precio estimado total



\### Módulo de Mensajería y Negociación

\- Chat interno entre comprador y productor

\- Envío de lista de productos al productor

\- Historial de conversaciones



\### Módulo de Acuerdos de Compra

\- Creación de acuerdos desde el carrito

\- Estados: Pendiente, Aceptado, Rechazado, Cancelado, Finalizado

\- Definición de punto de entrega, fecha y hora

\- Opciones: recoger o delivery



\### Módulo de Calificaciones

\- Calificación de 1 a 5 estrellas al productor

\- Comentario opcional

\- Calificación promedio visible en perfil del productor



\### Módulo de Notificaciones

\- Notificaciones de nuevos mensajes

\- Notificaciones de cambios en acuerdos

\- Notificaciones de solicitudes de compra



\### Panel del Comité (Administración)

\- Gestión de usuarios (ver, suspender, cancelar cuentas)

\- Panel de estadísticas del sistema

\- Módulo de relaciones entre usuarios

\- Registro de auditoría



\---



\## Limitaciones conocidas en v1.0.0



\- \*\*Persistencia:\*\* Los datos se almacenan en `localStorage` del navegador. No hay base de datos real en esta versión.

\- \*\*SMS simulado:\*\* El envío de código por SMS es simulado. La integración real con Twilio queda para v2.0.

\- \*\*Sin backend real:\*\* No hay servidor Node.js/Express. Toda la lógica corre en el frontend.

\- \*\*Imágenes locales:\*\* Las imágenes se manejan localmente, sin integración con Cloudinary.

\- \*\*Sin pagos en línea:\*\* Los pagos se realizan de forma presencial fuera de la plataforma.

\- \*\*Sin recuperación de contraseña:\*\* Pendiente para versión futura.

\- \*\*Sin pruebas automatizadas:\*\* Las pruebas de esta versión son manuales.

\- \*\*Sin modo offline real:\*\* La sincronización automática queda pendiente para v2.0.



\---



\## Errores corregidos

\- Correcciones de validación en formularios de registro

\- Ajustes de navegación entre pantallas de roles

\- Mejoras en visualización responsive para pantallas pequeñas



\---



\## Próximas mejoras previstas (v2.0)



\- Backend con Node.js + Express

\- Base de datos MySQL real

\- Autenticación SMS real con Twilio

\- Almacenamiento de imágenes con Cloudinary

\- Mensajería en tiempo real con Socket.io

\- Integración con WhatsApp Business API

\- Pruebas automatizadas con Vitest + React Testing Library

\- Recuperación de contraseña

\- Panel de estadísticas avanzadas

\- Modo offline con sincronización automática

\- Despliegue en Railway/Render



\---



\## Stack tecnológico v1.0.0



| Capa | Tecnología |

|------|------------|

| Frontend | React 19 + TypeScript |

| Estilos | Tailwind CSS 3 |

| Build | Vite 6 |

| Routing | React Router 7 |

| Estado servidor | TanStack Query 5 |

| Formularios | React Hook Form + Zod |

| Persistencia | localStorage (vía storage.ts) |

| Control de versiones | Git + GitHub |



\---



\## Repositorio



\*\*GitHub:\*\* https://github.com/MRrobotLily/La-Esperanza

\*\*Release tag:\*\* v1.0.0

