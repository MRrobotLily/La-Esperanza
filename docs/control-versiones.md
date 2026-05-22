# Control de Versiones - DERCAS La Esperanza

## Estrategia de Branching: Gitflow

Este proyecto utiliza Gitflow como estrategia de control de versiones.

---

## Estructura de Ramas

### Ramas principales (permanentes)

#### main
- Rama de produccion
- Solo contiene codigo estable y versionado
- Requiere Pull Request desde develop para actualizar
- Cada merge a main lleva un tag de version (v1.0.0, v1.1.0)

#### develop
- Rama de integracion donde se fusionan todas las features
- Contiene codigo funcional pero puede tener cambios en progreso
- Todas las ramas feature/ se integran aqui antes de pasar a main

---

### Ramas temporales (se eliminan despues del merge)

#### feature/[nombre-descriptivo]
- Desarrollo de nuevas funcionalidades o documentacion
- Se crean desde develop
- Se fusionan de regreso a develop mediante Pull Request
- Ejemplos: feature/arquitectura-docs-emersson, feature/pruebas-release-dalila

#### hotfix/[descripcion] (para versiones futuras)
- Correccion urgente en produccion
- Se crean desde main
- Se fusionan tanto a main como a develop

---

## Flujo de Trabajo del Equipo

### 1. Clonar el repositorio

git clone https://github.com/MRrobotLily/La-Esperanza.git
cd La-Esperanza

### 2. Actualizar la rama develop

git checkout develop
git pull origin develop

### 3. Crear rama de feature personal

git checkout -b feature/[nombre-descriptivo]

### 4. Trabajar en la rama

git add .
git commit -m "tipo: descripcion del cambio"

Tipos de commit:
- feat: nueva funcionalidad
- fix: correccion de bug
- docs: documentacion
- style: formato, espacios
- refactor: refactorizacion de codigo
- test: agregar o actualizar pruebas
- chore: tareas de mantenimiento

### 5. Subir cambios a GitHub

git push -u origin feature/[nombre-descriptivo]

### 6. Crear Pull Request

En GitHub:
1. Click en "Compare & pull request"
2. Base: develop, Compare: feature/[tu-rama]
3. Agregar descripcion del trabajo realizado
4. Solicitar revision de un companero
5. Esperar aprobacion
6. Hacer merge a develop

### 7. Eliminar la rama despues del merge

git checkout develop
git pull origin develop
git branch -d feature/[nombre-descriptivo]

---

## Versionado Semantico

El proyecto usa Semantic Versioning 2.0.0:

MAJOR.MINOR.PATCH

- MAJOR: Cambios incompatibles en la API (1.0.0 a 2.0.0)
- MINOR: Nueva funcionalidad compatible hacia atras (1.0.0 a 1.1.0)
- PATCH: Correcciones de bugs (1.0.0 a 1.0.1)

### Ejemplo de tags del proyecto:
- v1.0.0 - Release inicial (Fase 3 del proyecto academico)
- v2.0.0 - Implementacion del backend real (Fase 4 planificada)

---

## Workflow para el release v1.0.0

1. Cada desarrollador trabajo en su rama feature
2. Hicieron commits incrementales
3. Subieron su rama a GitHub
4. Crearon Pull Request a develop
5. Despues de aprobar los 3 PRs, Scrum Master hizo merge a main
6. Se creo el tag de version v1.0.0
7. Se publico el release en GitHub con las release notes

---

## Buenas Practicas

### Commits

Hacer:
- Commits pequenos y frecuentes
- Mensajes descriptivos en espanol
- Seguir la convencion de tipo (docs:, feat:, fix:)
- Un commit por cambio logico

Evitar:
- Commits gigantes con multiples cambios
- Mensajes vagos como "cambios" o "actualizacion"
- Mezclar documentacion con codigo en un mismo commit

### Pull Requests

Hacer:
- Describir claramente que se cambio y por que
- Solicitar revision de al menos un companero
- Resolver conflictos antes del merge
- Eliminar la rama despues del merge

Evitar:
- Mergear sin revision
- Dejar ramas obsoletas sin eliminar
- Pull Requests con cambios no relacionados

### Ramas

Hacer:
- Nombres descriptivos en minusculas con guiones
- Crear desde develop siempre actualizado
- Una rama por feature o tarea

Evitar:
- Nombres genericos como "cambios" o "temp"
- Trabajar directamente en main o develop
- Reutilizar ramas viejas

---

Documento elaborado por: Dalila Nineth Zacarias de Leon
Rol SCRUM: Scrum Master
Fecha: Mayo 2026
Version: 1.0
