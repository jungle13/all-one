# raffle-frontend/src/services/ticket_service.py

import uuid
import logging # <-- Se importa el módulo de logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from zoneinfo import ZoneInfo

from app.db.repositories.ticket import (
    get_raffle_by_id,
    find_and_lock_numbers,
    save_new_ticket,
    get_all_tickets_with_numbers_and_raffle,
    get_ticket_with_numbers_and_raffle,
    cancel_ticket_and_release_numbers,
    confirm_ticket_payment,
)
from app.db.models import Ticket, User
from app.schemas.ticket import TicketCreateRequest, TicketInfo
from app.modules.raffles.app.services.send_whatsapp_message import send_purchase_notification

# --- Configuración básica de logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - SERVICE - %(message)s')


async def create_ticket_service(data: TicketCreateRequest, db: AsyncSession, user: User) -> Ticket:
    """
    Orquesta la creación de un tiquete. La transacción es manejada por la dependencia get_db.
    """
    logging.info(f"Iniciando create_ticket_service para la rifa ID: {data.raffle_id} por el usuario '{user.username}'.")
    
    # --- Se elimina el bloque 'async with db.begin()' ---
    
    raffle = await get_raffle_by_id(db, data.raffle_id)
    if not raffle or raffle.status.lower() not in ['active', 'open']:
        logging.error(f"Validación fallida: La rifa {data.raffle_id} no existe o no está activa.")
        raise ValueError("La rifa no existe o no está activa.")
    logging.info("Validación de rifa exitosa.")

    existing_numbers = await find_and_lock_numbers(db, data.raffle_id, data.numbers)
    for num in existing_numbers:
        if num.status != 'available':
            logging.error(f"Validación fallida: El número {num.number} ya no está disponible.")
            raise ValueError(f"El número {num.number} ya no está disponible.")
    logging.info("Validación de disponibilidad de números exitosa.")

    
    # --- NUEVA LÓGICA ---
    # Confiamos directamente en el estado que nos envía el frontend.
    # Se realiza una validación simple para asegurar que el valor sea uno de los esperados.
    ticket_status = data.status.lower()
    if ticket_status not in ['paid', 'pending']:
        logging.error(f"Estado '{ticket_status}' no válido enviado desde el frontend.")
        raise ValueError("El estado del tiquete proporcionado no es válido.")
    logging.info(f"Lógica de negocio: El estado del tiquete se recibe del frontend como '{ticket_status}'.")

   # --- BLOQUE DE LÓGICA MODIFICADO ---
    expiration_time = None
    if ticket_status == "pending":
        if data.payment_date:
            # Si el tiquete es pendiente y el usuario dio una fecha, la usamos.
            logging.info(f"Tiquete 'pending' con fecha de pago programada: {data.payment_date}.")
            try:
                # Zona horaria de Cali/Colombia
                colombia_tz = ZoneInfo("America/Bogota")
                
                # Definimos la hora como el último momento del día.
                end_of_day_time = datetime.max.time().replace(microsecond=0)
                
                # Combinamos la fecha del usuario con la hora de fin del día.
                naive_datetime = datetime.combine(data.payment_date, end_of_day_time)
                
                # Asignamos la zona horaria correcta, creando un datetime "aware".
                expiration_time = naive_datetime.astimezone(colombia_tz)
                
                logging.info(f"Expiración establecida para (en zona horaria de Colombia): {expiration_time}")

            except Exception as e:
                logging.error(f"Error al procesar la zona horaria 'America/Bogota'. Asegúrese de que 'tzdata' esté disponible. Error: {e}. Usando fallback de 15 minutos.")
                # Fallback en caso de error con la zona horaria
                expiration_time = datetime.now(timezone.utc) + timedelta(minutes=15)
        else:
            # Si es pendiente pero no tiene fecha (no debería pasar con la lógica del front),
            # usamos un tiempo de gracia corto por seguridad.
            logging.warning("Tiquete 'pending' sin fecha de pago especificada. Usando expiración de 15 minutos por defecto.")
            expiration_time = datetime.now(timezone.utc) + timedelta(minutes=15)
    # --- FIN DEL BLOQUE MODIFICADO ---
    

    new_ticket_obj = Ticket(
        id=str(uuid.uuid4()),
        raffle_id=data.raffle_id,
        user_id=user.id,
        name=data.name,
        phone=data.phone,
        status=ticket_status,
        payment_type=data.payment_type,
        payment_date=data.payment_date,
        payment_proof_url=data.payment_proof_url,
        numbers_snapshot=data.numbers # <-- ¡AQUÍ GUARDAS LA FOTOGRAFÍA!
    )

    existing_numbers_map = {n.number for n in existing_numbers}
    new_number_strings = set(data.numbers) - existing_numbers_map
    logging.info(f"Preparando para guardar {len(existing_numbers)} números existentes y {len(new_number_strings)} números nuevos.")

    created_ticket = await save_new_ticket(
        db=db,
        ticket_data=new_ticket_obj,
        existing_numbers=existing_numbers,
        new_number_strings=new_number_strings,
        expiration_time=expiration_time
    )
    
    await db.flush()
        
    await db.refresh(created_ticket, attribute_names=['numbers', 'user'])
    
    # La notificación se envía después de que la transacción (manejada por get_db) sea exitosa.
    if created_ticket.status == 'paid':
        logging.info(f"Tiquete pagado. Enviando notificación de WhatsApp al número {created_ticket.phone}.")
        await send_purchase_notification(
            created_ticket.phone, 
            created_ticket.name, 
            created_ticket.id
        )
    
    logging.info(f"Servicio finalizado. Devolviendo tiquete ID: {created_ticket.id}")
    return created_ticket


async def list_tickets_service(db: AsyncSession) -> list[TicketInfo]:
    logging.info("Iniciando list_tickets_service...")
    # La limpieza de tiquetes expirados se puede añadir aquí si se retoma la lógica de 'pending'
    # await cleanup_expired_tickets(db)
    
    tickets = await get_all_tickets_with_numbers_and_raffle(db)
    logging.info(f"Se obtuvieron {len(tickets)} tiquetes del repositorio. Mapeando a TicketInfo...")
    
    ticket_responses = []
    for ticket in tickets:
        # Un tiquete cancelado no tendrá números, pero sigue siendo válido para listar.
        # Solo omitimos si falta la rifa, lo que indica un error de datos.
        if not ticket.raffle:
            logging.warning(f"Omitiendo tiquete ID {ticket.id} por no tener una rifa asociada.")
            continue
            
        raffle = ticket.raffle
        ticket_info = TicketInfo(
            id=ticket.id,
            name=ticket.name,
            phone=ticket.phone,
            raffle_id=ticket.raffle_id,
            status=ticket.status,
            responsible=ticket.user.username if ticket.user else None,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            payment_type=ticket.payment_type,
            payment_date=ticket.payment_date,
            payment_proof_url=ticket.payment_proof_url,
            numbers=[n.number for n in ticket.numbers],
            numbers_snapshot=ticket.numbers_snapshot,  # <-- AÑADIR ESTA LÍNE
            number_ids=[n.id for n in ticket.numbers],
            raffle_name=raffle.name,
            raffle_status=raffle.status,
            raffle_short_id=raffle.short_id,
            raffle_end_date=raffle.end_date,
            raffle_price=raffle.price
        )
        ticket_responses.append(ticket_info)
    
    logging.info(f"Mapeo completado. Devolviendo {len(ticket_responses)} tiquetes.")
    return ticket_responses


async def get_ticket_by_id_service(ticket_id: str, db: AsyncSession) -> TicketInfo | None:
    logging.info(f"Iniciando get_ticket_by_id_service para el ID: {ticket_id}")
    ticket = await get_ticket_with_numbers_and_raffle(db, ticket_id)
    if not ticket: 
        logging.warning(f"Tiquete con ID {ticket_id} no fue encontrado en el repositorio.")
        return None
        
    logging.info("Tiquete encontrado. Mapeando a TicketInfo...")
    raffle = ticket.raffle
    ticket_info = TicketInfo(
        id=ticket.id,
        name=ticket.name,
        phone=ticket.phone,
        raffle_id=ticket.raffle_id,
        status=ticket.status,
        responsible=ticket.user.username if ticket.user else None,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        payment_type=ticket.payment_type,
        payment_date=ticket.payment_date,
        payment_proof_url=ticket.payment_proof_url,
        numbers=[n.number for n in ticket.numbers],
        number_ids=[n.id for n in ticket.numbers],
        raffle_name=raffle.name,
        raffle_status=raffle.status,
        raffle_short_id=raffle.short_id,
        raffle_end_date=raffle.end_date,
        raffle_price=raffle.price,
    )
    logging.info("Mapeo completado. Devolviendo tiquete.")
    return ticket_info


async def cancel_ticket_service(ticket_id: str, db: AsyncSession):
    """
    Cancela un tiquete orquestando las operaciones a través de la capa de repositorios.
    """
    logging.info(f"Iniciando cancel_ticket_service para el ID: {ticket_id}")
    # La transacción es manejada por la dependencia get_db, se elimina el bloque begin()
    ticket = await get_ticket_with_numbers_and_raffle(db, ticket_id)
    
    if not ticket:
        logging.error(f"Validación fallida: El tiquete con ID {ticket_id} no fue encontrado.")
        raise ValueError(f"El tiquete con ID {ticket_id} no fue encontrado.")
    
    logging.info("Tiquete encontrado. Llamando al repositorio para cancelar y liberar números.")
    await cancel_ticket_and_release_numbers(db, ticket)
    logging.info("Operaciones de cancelación completadas, esperando commit de get_db.")

async def confirm_payment_service(ticket_id: str, db: AsyncSession):
    """
    Confirma el pago de un tiquete pendiente.
    """
    logging.info(f"Iniciando confirm_payment_service para el ID: {ticket_id}")
    # La transacción es manejada por la dependencia get_db, se elimina el bloque begin()
    ticket = await get_ticket_with_numbers_and_raffle(db, ticket_id)
    
    if not ticket:
        logging.error(f"Validación fallida: El tiquete con ID {ticket_id} no fue encontrado.")
        raise ValueError(f"El tiquete con ID {ticket_id} no fue encontrado.")
        
    if ticket.status != 'pending':
        logging.warning(f"El tiquete {ticket_id} no está en estado 'pending' (estado actual: {ticket.status}). No se puede confirmar el pago.")
        raise ValueError(f"Solo se puede confirmar el pago de tiquetes pendientes.")
        
    logging.info("Tiquete encontrado y validado. Llamando al repositorio para confirmar pago.")
    await confirm_ticket_payment(db, ticket)
    logging.info("Operaciones de confirmación de pago completadas, esperando commit de get_db.")
