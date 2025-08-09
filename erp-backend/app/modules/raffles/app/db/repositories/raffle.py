# app/db/repositories/raffle.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.modules.raffles.app.db.models import Raffle, Number
from sqlalchemy import select, func, text, String, and_
from app.modules.raffles.app.db.models import Raffle, Number


async def get_raffle_by_id(db: AsyncSession, raffle_id: str):
    result = await db.execute(select(Raffle).where(Raffle.id == raffle_id))
    return result.scalars().first()


async def insert_raffle(db: AsyncSession, raffle: Raffle):
    db.add(raffle)
    await db.commit()
    await db.refresh(raffle)
    return raffle

async def get_all_raffles(db: AsyncSession):
    result = await db.execute(select(Raffle))
    return result.scalars().all()

# --- FUNCIÓN PARA VERIFICAR DISPONIBILIDAD DE NÚMERO ---
# Esta función verifica si un número está disponible para una rifa específica.
# Se consulta directamente la base de datos para evitar conflictos de concurrencia.
# Devuelve True si el número está disponible, False en caso contrario.
async def is_number_available(db: AsyncSession, raffle_id: str, number_str: str) -> bool:
    """
    Verifica la disponibilidad de un número. Un número está disponible si:
    1. No está en la lista de números excluidos de la rifa.
    2. No existe en la tabla Number para esa rifa.
    3. Existe en la tabla Number pero su estado es 'available'.
    """
    # 1. Obtener la rifa para revisar los números excluidos (esto está bien)
    raffle_result = await db.execute(select(Raffle.excluded_numbers).where(Raffle.id == raffle_id))
    excluded_numbers = raffle_result.scalar_one_or_none()

    if excluded_numbers and number_str in excluded_numbers:
        return False # Correcto: No disponible si está excluido

    # 2. Consultar el registro completo del número, no solo su ID
    number_result = await db.execute(
        select(Number).where(Number.raffle_id == raffle_id, Number.number == number_str)
    )
    existing_number = number_result.scalars().first()

    # 3. Nueva Lógica de Decisión
    if existing_number is None:
        # Si el número nunca ha sido tocado (no tiene registro), está disponible.
        return True
    
    # Si el número existe, su disponibilidad depende de su estado.
    return existing_number.status == 'available'

# --- FUNCIÓN PARA OBTENER NÚMEROS ALEATORIOS DISPONIBLES ---
# Esta función obtiene una cantidad específica de números aleatorios disponibles para una rifa.
# Utiliza una consulta SQL optimizada para evitar conflictos de concurrencia.
# Devuelve una lista de números disponibles.

# --- FUNCIÓN REESCRITA: Ahora usa el constructor de consultas de SQLAlchemy ---
async def query_random_available_numbers(
    db: AsyncSession,
    raffle_id: str,
    count: int
) -> list[str]:
    """
    Obtiene 'count' números aleatorios y disponibles para una rifa,
    utilizando el constructor de consultas de SQLAlchemy para mayor seguridad y compatibilidad.
    """
    raffle = await db.get(Raffle, raffle_id)
    if not raffle:
        raise ValueError("Rifa no encontrada.")

    digits = raffle.dijits_per_number
    max_num = (10 ** digits) - 1

    # 1. Se crea una subconsulta que genera todos los números posibles en memoria.
    #    Esto es el equivalente a la cláusula `generate_series` en SQL.
    series = select(
        func.lpad(func.generate_series(0, max_num).cast(String), digits, '0').label('number')
    ).subquery('number_series')

    # 2. Se construye la consulta principal.
    query = (
        select(series.c.number)
        # Se cruza el universo de números con los ya vendidos/reservados.
        .outerjoin(Number, and_(Number.raffle_id == raffle_id, Number.number == series.c.number))
        # Se filtra para quedarse solo con los que NO están en la tabla 'numbers'.
        .where(Number.id == None)
    )

    # 3. Si hay números excluidos, se añade el filtro de forma segura.
    #    SQLAlchemy se encarga de formatear la cláusula NOT IN correctamente.
    if raffle.excluded_numbers:
        query = query.where(series.c.number.not_in(raffle.excluded_numbers))

    # 4. Se aplican el orden aleatorio y el límite al final.
    final_query = query.order_by(func.random()).limit(count)

    result = await db.execute(final_query)
    available_numbers = result.scalars().all()

    if len(available_numbers) < count:
        raise ValueError("No se pudieron generar suficientes números aleatorios disponibles.")
        
    return list(available_numbers)

