FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Construir la app
RUN npm run build

# Instalar serve para servir los archivos
RUN npm install -g serve

# Exponer puerto
EXPOSE 8080

# Comando para iniciar
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
