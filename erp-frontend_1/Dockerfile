# erp-frontend/Dockerfile (VERSIÓN FINAL)

# --- ETAPA 1: BUILD ---
FROM node:18 AS build

WORKDIR /app

# Declara un argumento de construcción que recibiremos desde docker-compose.
ARG REACT_APP_API_BASE_URL
# Se establece como una variable de entorno para que el build de React la use.
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- ETAPA 2: PRODUCCIÓN ---
FROM nginx:stable-alpine

# Se copian los archivos estáticos construidos.
COPY --from=build /app/build /usr/share/nginx/html

# Se elimina la configuración por defecto de Nginx y se copia la nuestra.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80