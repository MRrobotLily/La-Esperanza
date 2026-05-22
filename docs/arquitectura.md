# Arquitectura del Sistema

La arquitectura del sistema “La Esperanza” fue desarrollada utilizando una estructura modular basada en componentes, permitiendo organizar las distintas funcionalidades de la aplicación de una manera más ordenada y fácil de mantener.

El sistema fue construido utilizando React y TypeScript para el desarrollo del frontend, mientras que Tailwind CSS fue utilizado para el diseño visual y responsive de la interfaz.

Actualmente el proyecto funciona principalmente del lado del cliente, utilizando almacenamiento local para manejar parte de la información mientras se desarrolla una integración más completa con backend y base de datos.

La estructura general del sistema se divide en módulos principales como autenticación, productos, catálogo, comunicación, lista de interés y administración.

## Descripción de Componentes

### Componente de autenticación
Permite registrar usuarios e iniciar sesión dentro de la plataforma.

### Componente de productos
Permite publicar, editar y visualizar productos agrícolas disponibles en el sistema.

### Componente de catálogo
Muestra los productos disponibles para compradores y visitantes.

### Componente de lista de interés
Permite al comprador guardar productos antes de comunicarse con el productor.

### Componente de comunicación
Permite la interacción entre compradores y productores mediante mensajes y notificaciones.

### Componente administrativo
Permite al comité revisar usuarios y controlar información general del sistema.

### Componente de interfaz
Se encarga de la navegación y visualización responsive de la aplicación.

## Observaciones

La arquitectura actual del sistema permite futuras integraciones con backend y base de datos sin modificar completamente la estructura principal del frontend.