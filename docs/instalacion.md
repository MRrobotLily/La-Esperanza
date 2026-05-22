# Instalación y Configuración

## Requisitos Previos

Para ejecutar el sistema “La Esperanza” de manera local es necesario contar con los siguientes requisitos:

- Sistema operativo Windows, Linux o macOS.
- Node.js instalado.
- Git instalado.
- Visual Studio Code como entorno de desarrollo recomendado.
- Conexión a internet para descargar dependencias.

## Instalación del Proyecto

Para instalar el proyecto de forma local, primero se debe clonar el repositorio desde GitHub:

git clone https://github.com/MRrobotLily/La-Esperanza.git

Luego se ingresa a la carpeta del proyecto:

cd La-Esperanza

Después se instalan las dependencias necesarias:

npm install

Finalmente se ejecuta el proyecto:

npm run dev

## Configuración del Entorno

El proyecto fue trabajado utilizando Visual Studio Code como entorno de desarrollo principal, ya que permite abrir la carpeta completa del sistema, utilizar la terminal integrada y editar los archivos de forma ordenada.

Para ejecutar la aplicación fue necesario instalar Node.js, debido a que el proyecto utiliza dependencias de JavaScript y se ejecuta mediante Vite. También se utilizó Git para el control de versiones y GitHub para guardar los avances del equipo en un repositorio compartido.

El entorno local permite realizar pruebas antes de subir cambios al repositorio, evitando afectar directamente el trabajo de los demás integrantes. Cada integrante trabaja desde su propia rama y luego sube sus cambios mediante commits.

## Ejecución Local

Para ejecutar el sistema de forma local se utiliza el comando:

npm run dev

Este comando inicia el servidor de desarrollo de Vite y genera una dirección local similar a:

http://localhost:5173/

Al abrir esa dirección en el navegador, se puede visualizar la aplicación y probar las funciones principales del sistema.

Esta ejecución local permite detectar errores y revisar cambios antes de subirlos al repositorio.