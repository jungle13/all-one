# raffle-backend/Dockerfile (VERSIÓN FINAL CORREGIDA)

# --- ETAPA 1: BUILDER ---
FROM python:3.11-slim AS builder

WORKDIR /app
RUN pip install poetry
ENV POETRY_VIRTUALENVS_CREATE=false
COPY pyproject.toml poetry.lock ./
RUN poetry install --without dev --no-root


# --- ETAPA 2: PRODUCCIÓN ---
FROM python:3.11-slim

WORKDIR /app
RUN pip install poetry
ENV POETRY_VIRTUALENVS_CREATE=false

# Se copian las dependencias y los ejecutables
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# ---- ¡LA CORRECCIÓN ESTÁ AQUÍ! ----
# Se copia la carpeta de assets DESDE la ubicación correcta (dentro de 'app').
COPY ./app/assets ./app/assets/

# Se copia el código fuente de la aplicación.
COPY ./app ./app/
COPY ./main.py .
COPY ./create_first_user.py .

EXPOSE 8000

# Se llama a 'gunicorn' directamente.
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]