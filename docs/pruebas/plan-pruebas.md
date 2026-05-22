# Plan de Pruebas - DERCAS La Esperanza

## Informacion del Proyecto

**Nombre del proyecto:** Sistema de Gestion y Comercializacion Agricola "La Esperanza"
**Version:** 1.0.0
**Fecha:** Mayo 2026
**Responsable de pruebas:** Dalila Nineth Zacarias de Leon (Scrum Master)

---

## Objetivos del Plan de Pruebas

### Objetivo General
Verificar que el sistema DERCAS La Esperanza v1.0.0 cumple con los requisitos funcionales y no funcionales establecidos, asegurando que las funcionalidades principales operen correctamente en el entorno de desarrollo.

### Objetivos Especificos
1. Validar el flujo completo de autenticacion y registro de usuarios
2. Verificar el funcionamiento del catalogo de productos y carrito de compras
3. Comprobar la comunicacion entre compradores y productores via mensajeria
4. Validar la gestion de acuerdos de compra y sus estados
5. Verificar el sistema de calificaciones y notificaciones
6. Comprobar el panel administrativo del comite
7. Validar la persistencia de datos en localStorage

---

## Alcance de las Pruebas

### Funcionalidades a Probar

#### En Alcance
- Modulo de Autenticacion (registro, login, logout, verificacion SMS simulada)
- Modulo de Perfil (visualizacion, edicion, carga de imagenes)
- Modulo de Productos (CRUD completo para productores)
- Modulo de Catalogo (visualizacion, filtros, detalles)
- Modulo de Carrito (agregar, modificar, eliminar productos)
- Modulo de Mensajeria (chat entre usuarios, historial)
- Modulo de Acuerdos (creacion, estados, confirmacion)
- Modulo de Calificaciones (calificar productores, visualizar promedio)
- Modulo de Notificaciones (recepcion, visualizacion)
- Panel del Comite (gestion de usuarios, estadisticas)
- Navegacion entre roles (Productor, Comprador, Comite)

#### Fuera de Alcance
- Integracion real con Twilio (SMS real)
- Integracion con WhatsApp Business API
- Pasarelas de pago en linea
- Sincronizacion con base de datos externa
- Almacenamiento en Cloudinary
- Pruebas de carga y rendimiento
- Pruebas de seguridad avanzadas
- Pruebas en multiples navegadores (solo Chrome/Edge)

---

## Estrategia de Pruebas

### Tipos de Pruebas

#### 1. Pruebas Funcionales
**Objetivo:** Verificar que cada funcionalidad opere segun los requisitos.
**Metodo:** Pruebas manuales exploratorias y casos de prueba documentados.
**Responsable:** Dalila Zacarias
**Cobertura objetivo:** 90% de las historias de usuario implementadas.

#### 2. Pruebas de Interfaz de Usuario
**Objetivo:** Validar que la UI sea intuitiva y responsive.
**Metodo:** Pruebas manuales en resolucion 1920x1080 y 1366x768.
**Responsable:** Dalila Zacarias
**Criterio de exito:** Navegacion fluida, elementos visibles, sin errores de diseno.

#### 3. Pruebas de Integracion
**Objetivo:** Verificar que los modulos interactuen correctamente.
**Metodo:** Flujos completos end-to-end (ejemplo: registro > publicar producto > vender > calificar).
**Responsable:** Dalila Zacarias
**Cobertura:** 5 flujos criticos principales.

#### 4. Pruebas de Persistencia
**Objetivo:** Validar que los datos se guarden correctamente en localStorage.
**Metodo:** Crear datos, recargar pagina, verificar persistencia.
**Responsable:** Dalila Zacarias
**Criterio de exito:** 100% de los datos se mantienen despues de recarga.

---

## Criterios de Aceptacion

### Criterios de Entrada (para iniciar las pruebas)
- El codigo fuente esta completo y funcional en develop
- La aplicacion corre sin errores en localhost:5173
- Los datos de prueba estan cargados mediante seed.ts
- El entorno de desarrollo esta configurado correctamente

### Criterios de Salida (para dar por finalizadas las pruebas)
- Se ejecutaron todos los casos de prueba documentados
- Se tomaron capturas de pantalla de evidencia para cada caso critico
- Se documentaron los defectos encontrados (si los hay)
- La cobertura de pruebas alcanza al menos 85% de las funcionalidades
- Se genero el reporte de cobertura de pruebas

### Criterios de Aceptacion del Sistema
- Todas las historias de usuario marcadas como "Implementadas" funcionan correctamente
- Los flujos criticos (registro, compra, calificacion) operan sin errores
- La persistencia de datos funciona al 100%
- La navegacion entre roles no presenta errores
- No existen errores criticos (P0 o P1) sin resolver

---

## Recursos Necesarios

### Recursos Humanos
- **Scrum Master (Tester):** Dalila Zacarias - Ejecucion de pruebas, documentacion
- **Product Owner:** Emersson Alvizures - Validacion de requisitos
- **Desarrollador:** Julieta Pinto - Soporte tecnico para resolucion de defectos

### Recursos Tecnicos
- Computadora con navegador Chrome o Edge (version reciente)
- Entorno de desarrollo local con Node.js y Vite
- Herramienta de captura de pantalla (Windows Snipping Tool)
- Repositorio Git local actualizado

### Recursos de Software
- Visual Studio Code (para revisar codigo si es necesario)
- Git Bash (para gestion de versiones)
- Chrome DevTools (para inspeccion de localStorage)

---

## Datos de Prueba

### Datos Precargados (seed.ts)

**Usuarios de Prueba:**
- Productor: Juan Perez (5512-3456, rol: productor)
- Comprador: Maria Lopez (5598-7654, rol: comprador)
- Comite: Admin Sistema (5500-0001, rol: comite)

**Productos de Prueba:**
- Tomate Rojo (categoria: Hortalizas, precio: Q15/lb)
- Frijol Negro (categoria: Granos, precio: Q8/lb)
- Aguacate Hass (categoria: Frutas, precio: Q10/unidad)
- Limon Persa (categoria: Frutas, precio: Q5/lb)

**Datos Adicionales:**
- 3 acuerdos de prueba en diferentes estados
- 5 mensajes de prueba entre usuarios
- 8 notificaciones de prueba
- 4 calificaciones de prueba

---

## Ambiente de Pruebas

### Configuracion del Entorno
- **Sistema Operativo:** Windows 10/11
- **Navegador:** Chrome 120+ o Edge 120+
- **Resolucion de pantalla:** 1920x1080 (principal), 1366x768 (secundaria)
- **Node.js:** v20+
- **Servidor de desarrollo:** Vite (localhost:5173)

### Datos de Entorno
- localStorage habilitado en el navegador
- Cookies habilitadas
- JavaScript habilitado
- Cache del navegador limpio al inicio de cada sesion de pruebas

---

## Riesgos y Mitigacion

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Perdida de datos en localStorage al limpiar cache | Media | Alto | Documentar como restaurar datos con seed.ts |
| Incompatibilidad con navegadores antiguos | Baja | Medio | Especificar versiones minimas en la documentacion |
| Defectos criticos cerca de la fecha de entrega | Media | Alto | Ejecutar pruebas con 48 horas de anticipacion |
| Falta de tiempo para probar todos los modulos | Baja | Medio | Priorizar flujos criticos primero |

---

## Cronograma de Pruebas

| Actividad | Duracion Estimada | Responsable |
|-----------|-------------------|-------------|
| Preparacion del ambiente de pruebas | 30 min | Dalila |
| Ejecucion de casos de prueba funcionales | 2 horas | Dalila |
| Toma de capturas de pantalla (evidencias) | 30 min | Dalila |
| Documentacion de defectos encontrados | 30 min | Dalila |
| Generacion de reporte de cobertura | 20 min | Dalila |
| Revision con el equipo | 30 min | Todo el equipo |

**Tiempo total estimado:** 4.5 horas

---

## Entregables de Pruebas

1. Plan de Pruebas (este documento)
2. Casos de Prueba documentados (casos-prueba.md)
3. Evidencias fotograficas (carpeta docs/pruebas/evidencias/)
4. Reporte de Cobertura de Pruebas (cobertura.md)
5. Matriz de Trazabilidad (matriz-trazabilidad.md)

---

## Metricas de Calidad

### Metricas a Recopilar
- Numero total de casos de prueba ejecutados
- Numero de casos exitosos vs fallidos
- Porcentaje de cobertura de historias de usuario
- Numero de defectos encontrados por severidad
- Tiempo promedio de ejecucion por caso de prueba

### Criterios de Exito del Plan
- Al menos 85% de casos de prueba ejecutados exitosamente
- Cobertura de al menos 40 de las 44 historias de usuario (90%)
- Cero defectos de severidad critica (P0) sin resolver
- Maximo 2 defectos de severidad alta (P1) documentados

---

**Documento elaborado por:** Dalila Nineth Zacarias de Leon
**Rol SCRUM:** Scrum Master
**Fecha:** Mayo 2026
**Version:** 1.0
