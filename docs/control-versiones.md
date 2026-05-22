\# Control de Versiones — DERCAS La Esperanza



\## Estrategia de Branching: Gitflow



Este proyecto utiliza \*\*Gitflow\*\* como estrategia de control de versiones. Gitflow es un modelo de ramificación diseñado para proyectos que requieren releases planificados.



\---



\## 📊 Estructura de Ramas



\### Ramas principales (permanentes)



\#### `main`

\- \*\*Propósito:\*\* Rama de producción. Solo contiene código estable y versionado.

\- \*\*Protección:\*\* Requiere Pull Request desde `develop` para actualizar.

\- \*\*Tags:\*\* Cada merge a `main` lleva un tag de versión (ej: `v1.0.0`, `v1.1.0`).



\#### `develop`

\- \*\*Propósito:\*\* Rama de integración donde se fusionan todas las features.

\- \*\*Estado:\*\* Contiene código funcional pero puede tener cambios en progreso.

\- \*\*Flujo:\*\* Todas las ramas `feature/` se integran aquí antes de pasar a `main`.



\---



\### Ramas temporales (se eliminan después del merge)



\#### `feature/\[nombre-descriptivo]`

\- \*\*Propósito:\*\* Desarrollo de nuevas funcionalidades o documentación.

\- \*\*Origen:\*\* Se crean desde `develop`.

\- \*\*Destino:\*\* Se fusionan de regreso a `develop` mediante Pull Request.

\- \*\*Nomenclatura:\*\* `feature/arquitectura-docs-emersson`, `feature/pruebas-release-dalila`, `feature/datos-api-julieta`.



\#### `hotfix/\[descripcion]` (para versiones futuras)

\- \*\*Propósito:\*\* Corrección urgente en producción.

\- \*\*Origen:\*\* Se crean desde `main`.

\- \*\*Destino:\*\* Se fusionan tanto a `main` como a `develop`.



\---



\## 🔄 Flujo de Trabajo del Equipo



\### 1. Clonar el repositorio



```bash

git clone https://github.com/MRrobotLily/La-Esperanza.git

cd La-Esperanza

```



\### 2. Actualizar la rama `develop`



```bash

git checkout develop

git pull origin develop

```



\### 3. Crear rama de feature personal



```bash

git checkout -b feature/\[nombre-descriptivo]

```



Ejemplos:

\- `feature/arquitectura-docs-emersson`

\- `feature/datos-api-julieta`

\- `feature/pruebas-release-dalila`



\### 4. Trabajar en la rama



```bash

\# Hacer cambios en los archivos

git add .

git commit -m "tipo: descripción del cambio"

```



\*\*Tipos de commit:\*\*

\- `feat:` nueva funcionalidad

\- `fix:` corrección de bug

\- `docs:` documentación

\- `style:` formato, espacios (sin cambio de lógica)

\- `refactor:` refactorización de código

\- `test:` agregar o actualizar pruebas

\- `chore:` tareas de mantenimiento, configuración



\### 5. Subir cambios a GitHub



```bash

git push -u origin feature/\[nombre-descriptivo]

```



\### 6. Crear Pull Request



En GitHub:

1\. Ir al repositorio

2\. Click en \*\*"Compare \& pull request"\*\*

3\. Base: `develop` ← Compare: `feature/\[tu-rama]`

4\. Agregar descripción del trabajo realizado

5\. Solicitar revisión de un compañero

6\. Esperar aprobación

7\. Hacer \*\*merge\*\* a `develop`



\### 7. Eliminar la rama después del merge



```bash

git checkout develop

git pull origin develop

git branch -d feature/\[nombre-descriptivo]

```



\---



\## 🏷️ Versionado Semántico



El proyecto usa \*\*Semantic Versioning 2.0.0\*\*:

