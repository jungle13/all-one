# erp-backend/Dockerfile (VERSIÓN DE ORO - FINAL)

# --- ETAPA 1: BUILDER ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Instala Poetry y configura el entorno
RUN pip install poetry
ENV POETRY_VIRTUALENVS_CREATE=false

# Copia los archivos de dependencias e instala los paquetes
COPY pyproject.toml poetry.lock ./
RUN poetry install --without dev --no-root


# --- ETAPA 2: PRODUCCIÓN ---
FROM python:3.11-slim

WORKDIR /app

# Se copian las dependencias y los ejecutables desde la etapa "builder"
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Se copia la carpeta de assets que contiene las imágenes y fuentes
COPY ./app/assets ./app/assets/

# Se copia el código fuente de la aplicación
COPY ./app ./app/
COPY ./main.py .
COPY ./create_first_user.py .

EXPOSE 8000

# Se llama a 'gunicorn' directamente
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
