# app/services/raffle_service.py
import uuid
import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func, and_, cast, Integer
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Mapped, mapped_column

from app.schemas.raffle import RaffleCreateRequest, RaffleResponse, RaffleStatistics, SoldTicketInfo, RaffleUpdateRequest, RaffleDetailResponse
from app.db.models import Raffle, Ticket, Number, User
from app.modules.raffles.app.db.repositories.raffle import is_number_available, query_random_available_numbers



# --- FUNCIÓN AUXILIAR PARA GENERAR ID CORTO ---
def generate_short_id(length=5):
    """Genera un ID corto alfanumérico en mayúsculas."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# --- FUNCIÓN PARA CREAR UNA NUEVA RIFA ---
async def create_raffle_service(data: RaffleCreateRequest, db: AsyncSession, user: User) -> str:
    """
    Crea una nueva rifa, valida la configuración de paquetes y números excluidos,
    y guarda dichos números como no disponibles en la base de datos.
    """
    print(f"[BACKEND - Service] create_raffle_service llamado con los datos validados.")
    # 1. Validación de la lógica de negocio para paquetes (sin cambios)
    if data.numbers_per_ticket <= 0:
        raise ValueError("La cantidad de números por tiquete debe ser mayor a cero.")

    universo = 10 ** data.dijits_per_number
    numeros_a_excluir_calculados = universo % data.numbers_per_ticket

    # Se valida que la cantidad de números excluidos en la lista coincida con el cálculo
    if len(data.excluded_numbers) != numeros_a_excluir_calculados:
        raise ValueError(
            f"Error de integridad: La cantidad de números excluidos ({len(data.excluded_numbers)}) "
            f"no coincide con la cantidad requerida por el cálculo ({numeros_a_excluir_calculados})."
        )

    # 2. Creación del objeto Rifa (sin cambios)
    raffle_id = str(uuid.uuid4())
    while True:
        short_id = generate_short_id()
        result = await db.execute(select(Raffle).where(Raffle.short_id == short_id))
        if result.scalars().first() is None:
            break

    new_raffle = Raffle(
        id=raffle_id,
        short_id=short_id,
        name=data.name,
        dijits_per_number=data.dijits_per_number,
        numbers_per_ticket=data.numbers_per_ticket,
        excluded_numbers=data.excluded_numbers,
        end_date=data.end_date,
        price=data.price,
        prize_cost=data.prize_cost,
        status=data.status,
        description=data.description,
        owner_id=user.id,
        image_url=data.image_url,
    )
    db.add(new_raffle)

    # --- PASO ADICIONAL: Guardar los números excluidos en la tabla 'Number' ---
    if data.excluded_numbers:
        # Se crea una lista de objetos 'Number' para cada número excluido
        excluded_number_objects = [
            Number(
                raffle_id=raffle_id,
                number=num_str,
                status='excluded' # Estado que los marca como no disponibles para la venta
            )
            for num_str in data.excluded_numbers
        ]
        # Se añaden todos los nuevos objetos a la sesión de la base de datos
        db.add_all(excluded_number_objects)

    # 4. Se confirman todos los cambios en una sola transacción
    await db.commit()
    await db.refresh(new_raffle)
    return new_raffle

# --- FUNCIÓN PARA ACTUALIZAR UNA RIFA ---
# Esta función actualiza los detalles de una rifa existente, asegurándose de que no se cambien los dígitos de una rifa que ya tiene tiquetes vendidos.
async def update_raffle_service(raffle_id: str, data: RaffleUpdateRequest, db: AsyncSession) -> RaffleDetailResponse:
    """
    Actualiza una rifa existente de forma segura, cargando todas las relaciones
    necesarias explícitamente y devolviendo la respuesta detallada completa.
    """
    # 1. Obtener la rifa cargando sus relaciones de forma explícita (Eager Loading)
    #    Esto previene el error 'greenlet_spawn'.
    query = (
        select(Raffle)
        .options(
            selectinload(Raffle.tickets).selectinload(Ticket.numbers), # Carga tiquetes y sus números
            selectinload(Raffle.owner)                                # Carga el dueño
        )
        .where(Raffle.id == raffle_id)
    )
    result = await db.execute(query)
    raffle_in_db = result.scalars().first()
    
    if not raffle_in_db:
        raise ValueError("La rifa no fue encontrada.")

    # --- LÓGICA DE VALIDACIÓN MEJORADA ---
    # Se verifica si existe algún tiquete que NO esté cancelado.
    has_active_tickets = any(ticket.status not in ['cancelled'] for ticket in raffle_in_db.tickets)
    # Obtiene un diccionario solo con los campos que el frontend envió
    update_data = data.model_dump(exclude_unset=True)

    if has_active_tickets:
        allowed_keys = {'end_date', 'status', 'description', 'image_url', 'name'} # Campos permitidos
        
        # Se comprueba si se está intentando modificar un campo no permitido
        if not set(update_data.keys()).issubset(allowed_keys):
            raise ValueError("Esta rifa ya tiene tiquetes activos (vendidos o pendientes). No se puede modificar su estructura (dígitos, precio, etc.).")
    
    # Si no hay tiquetes activos, se permite la actualización de cualquier campo.
    for key, value in update_data.items():
        if value is not None:
            setattr(raffle_in_db, key, value)
    
    db.add(raffle_in_db)
    await db.commit()
    
    # Se refrescan las relaciones que podrían haber cambiado o que se necesitan para la respuesta
    await db.refresh(raffle_in_db, attribute_names=['tickets', 'owner'])
    
    return _build_raffle_detail_response(raffle_in_db)

# --- FUNCIÓN AUXILIAR CORREGIDA ---
# Esta función construye la respuesta de una rifa, incluyendo estadísticas y participantes.
# Se asegura de que los cálculos de estadísticas sean correctos y se manejen adecuadamente los números excluidos.   
def _build_raffle_response(raffle: Raffle, tickets_sold: int, participants: int) -> RaffleResponse:
    # --- LÓGICA DE ESTADÍSTICAS CORREGIDA ---
    # 1. Se calcula el universo total de números.
    universo = 10 ** raffle.dijits_per_number if raffle.dijits_per_number else 0
    
    # 2. Se calcula el total de números que se pueden vender.
    numeros_vendibles = universo - len(raffle.excluded_numbers)
    
    # 3. Se calcula cuántos tiquetes (paquetes) se pueden vender en total.
    # Se usa división entera (//) por si acaso, aunque la exclusión ya debería garantizarlo.
    total_tickets_posibles = numeros_vendibles // raffle.numbers_per_ticket

    statistics = RaffleStatistics(
        tickets_sold=tickets_sold,
        total_tickets=total_tickets_posibles, # <-- Se usa el cálculo correcto.
        participants=participants
    )

    # --- RESPUESTA CORREGIDA ---
    return RaffleResponse(
        id=raffle.id,
        short_id=raffle.short_id,
        name=raffle.name,
        status=raffle.status,
        description=raffle.description,
        end_date=raffle.end_date,
        price=raffle.price,
        prize_cost=raffle.prize_cost,
        dijits_per_number=raffle.dijits_per_number,
        image_url=raffle.image_url,
        
        # <-- Se eliminan los campos obsoletos 'total_numbers' y 'excluded_number'.
        
        # <-- Se añaden los nuevos campos requeridos por el schema.
        numbers_per_ticket=raffle.numbers_per_ticket,
        excluded_numbers=raffle.excluded_numbers,
        
        statistics=statistics,
    )

# --- FUNCIÓN AUXILIAR PARA DETALLES DE RIFA ---
# Esta función construye la respuesta detallada de una rifa, incluyendo estadísticas y tiquetes vendidos.
def _build_raffle_detail_response(raffle: Raffle) -> RaffleDetailResponse:
    """
    Construye la respuesta detallada de una rifa, incluyendo estadísticas precisas
    y una lista completa de los tiquetes activos (pagados y pendientes) con toda
    la información necesaria para el frontend.
    """
    # --- LÓGICA DE ESTADÍSTICAS (SIN CAMBIOS) ---
    universo = 10 ** raffle.dijits_per_number if raffle.dijits_per_number else 0
    numeros_vendibles = universo - len(raffle.excluded_numbers)
    total_tickets_posibles = numeros_vendibles // raffle.numbers_per_ticket if raffle.numbers_per_ticket > 0 else 0

    # --- LÓGICA DE FILTRADO Y CONTEO (AJUSTADA) ---
    
    # 1. Filtramos para obtener tiquetes que no estén cancelados (es decir, pagados y pendientes)
    active_tickets = [t for t in raffle.tickets if t.status in ['paid', 'pending']]
    
    # 2. El conteo de "tiquetes vendidos" ahora incluye tanto pagados como pendientes para las estadísticas de progreso.
    tickets_sold_count = len(active_tickets)
    
    # 3. El conteo de participantes únicos se basa en los tiquetes activos.
    participants_count = len(set(t.name for t in active_tickets))

    statistics = RaffleStatistics(
        tickets_sold=tickets_sold_count,
        total_tickets=total_tickets_posibles,
        participants=participants_count
    )
    
    # --- CONSTRUCCIÓN DE LA LISTA DE TIQUETES (CORREGIDA Y ENRIQUECIDA) ---
    # Aquí está el cambio principal: ahora poblamos el objeto SoldTicketInfo
    # con todos los datos que el frontend necesita.
    sold_tickets_info = []
    for t in active_tickets:
        sold_tickets_info.append(
            SoldTicketInfo(
                id=t.id,
                name=t.name,
                numbers=[n.number for n in t.numbers],
                status=t.status,
                created_at=t.created_at,
                responsible=t.user.username if t.user else "Sistema" # Manejo seguro por si no hay usuario
            )
        )

    # --- RESPUESTA FINAL (SIN CAMBIOS ESTRUCTURALES) ---
    return RaffleDetailResponse(
        id=raffle.id,
        short_id=raffle.short_id,
        name=raffle.name,
        status=raffle.status,
        description=raffle.description,
        end_date=raffle.end_date,
        price=raffle.price,
        prize_cost=raffle.prize_cost,
        dijits_per_number=raffle.dijits_per_number,
        image_url=raffle.image_url,
        numbers_per_ticket=raffle.numbers_per_ticket,
        excluded_numbers=raffle.excluded_numbers,
        statistics=statistics,
        sold_tickets=sold_tickets_info # <-- Ahora esta lista contiene toda la información
    )

# --- FUNCIÓN PARA LISTAR LAS RIFAS ---
async def list_raffles_service(db: AsyncSession) -> list[RaffleResponse]:
    subquery_tickets_sold = (
        select(Ticket.raffle_id, func.count(Number.id).label("tickets_sold_count"))
        .join(Number, Ticket.id == Number.ticket_id)
        .where(Ticket.status == 'paid')
        .group_by(Ticket.raffle_id)
        .subquery()
    )
    subquery_participants = (
        select(Ticket.raffle_id, func.count(func.distinct(Ticket.name)).label("participants_count"))
        .where(Ticket.status == 'paid')
        .group_by(Ticket.raffle_id)
        .subquery()
    )
    query = (
        select(Raffle,
               func.coalesce(subquery_tickets_sold.c.tickets_sold_count, 0).label("tickets_sold"),
               func.coalesce(subquery_participants.c.participants_count, 0).label("participants"))
        .outerjoin(subquery_tickets_sold, Raffle.id == subquery_tickets_sold.c.raffle_id)
        .outerjoin(subquery_participants, Raffle.id == subquery_participants.c.raffle_id)
    )
    result = await db.execute(query)
    
# 1. Primero. creo una lista vacía para almacenar el objeto rifa completo, los tiquetes vendidos y los participantes.
    raffles_responses = []
# 2. Obtiene todos los resultados únicos de la consulta de la base de datos.
#    El resultado es una lista donde cada elemento es una tupla, por ejemplo:
#    (objeto_Raffle, 10, 5)
    database_rows = result.unique().all()

    for row in database_rows:
        raffle_object = row.Raffle
        tickets_sold = row.tickets_sold
        participants = row.participants

        raffle_response = _build_raffle_response(raffle_object, tickets_sold, participants)
        raffles_responses.append(raffle_response)

    return raffles_responses

# --- FUNCIÓN PARA OBTENER DETALLES DE UNA RIFA ---
async def get_raffle_service(raffle_id: str, db: AsyncSession) -> RaffleDetailResponse:
    query = (
        select(Raffle)
        .options(
            selectinload(Raffle.tickets)
            .selectinload(Ticket.user), # <-- AÑADE ESTA LÍNEA
            selectinload(Raffle.tickets)
            .selectinload(Ticket.numbers)
        )
        .where(Raffle.id == raffle_id)
    )
    result = await db.execute(query)
    raffle = result.scalars().unique().first()

    if not raffle:
        raise ValueError("Raffle not found")
    return _build_raffle_detail_response(raffle)

# --- FUNCIÓN PARA VERIFICAR DISPONIBILIDAD DE NÚMERO ---
# Esta función llama a la función is_number_available del repositorio para verificar si un número está disponible para una rifa específica.
# Se usa para evitar conflictos de concurrencia y asegurar que el número no esté reservado o asignado.
async def check_number_availability_service(raffle_id: str, number_str: str, db: AsyncSession) -> bool:
    return await is_number_available(db, raffle_id, number_str)

# --- FUNCIÓN PARA OBTENER NÚMEROS ALEATORIOS DISPONIBLES ---
#Esta funcion llama a la función query_random_available_numbers del repositorio para obtener una cantidad específica de números aleatorios disponibles para una rifa.
# Se usa para evitar conflictos de concurrencia y asegurar que los números no estén reservados o asignados.
async def get_random_available_numbers_service(
    raffle_id: str,
    count: int,
    db: AsyncSession
) -> list[str]:
    """
    Obtiene N números aleatorios y disponibles, delegando la consulta
    a la capa de repositorios y validando el resultado.
    """
    # 1. La lógica de negocio es llamar al repositorio
    available_numbers = await query_random_available_numbers(db, raffle_id, count)
    
    # 2. El servicio se encarga de la validación de negocio
    if len(available_numbers) < count:
        raise ValueError("No se pudieron generar suficientes números aleatorios disponibles.")
        
    return available_numbers