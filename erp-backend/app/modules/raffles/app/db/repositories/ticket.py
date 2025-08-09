# app/db/repositories/ticket.py

import uuid
import logging # <-- Se importa el módulo de logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from datetime import datetime, date
from sqlalchemy import update

from app.db.models import Ticket, Number, Raffle, User
from app.modules.raffles.app.schemas.ticket import TicketCreateRequest

# --- Configuración básica de logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - REPO - %(message)s')


# --- FUNCIONES DE LECTURA (READ) ---

async def get_raffle_by_id(db: AsyncSession, raffle_id: str) -> Raffle | None:
    logging.info(f"Buscando rifa con ID: {raffle_id}")
    result = await db.execute(select(Raffle).where(Raffle.id == raffle_id))
    raffle = result.scalars().first()
    if raffle:
        logging.info(f"Rifa '{raffle.name}' encontrada.")
    else:
        logging.warning(f"Rifa con ID {raffle_id} no fue encontrada.")
    return raffle


async def find_and_lock_numbers(db: AsyncSession, raffle_id: str, numbers: list[str]) -> list[Number]:
    if not numbers:
        return []
    logging.info(f"Buscando y bloqueando {len(numbers)} números para la rifa ID: {raffle_id}")
    query = (
        select(Number)
        .where(Number.raffle_id == raffle_id, Number.number.in_(numbers))
        .with_for_update()
    )
    result = await db.execute(query)
    found_numbers = list(result.scalars().all())
    logging.info(f"Se encontraron {len(found_numbers)} registros de números existentes para bloquear.")
    return found_numbers


async def get_ticket_with_numbers_and_raffle(db: AsyncSession, ticket_id: str):
    logging.info(f"Buscando tiquete detallado con ID: {ticket_id}")
    result = await db.execute(
        select(Ticket).options(
            selectinload(Ticket.numbers),
            joinedload(Ticket.raffle),
            joinedload(Ticket.user)
        ).where(Ticket.id == ticket_id)
    )
    return result.scalars().unique().first()



async def get_all_tickets_with_numbers_and_raffle(db: AsyncSession):
    logging.info("Buscando todos los tiquetes con sus relaciones...")
    result = await db.execute(
        select(Ticket).options(
            selectinload(Ticket.numbers),
            joinedload(Ticket.raffle),
            joinedload(Ticket.user)
        )
    )
    tickets = result.scalars().unique().all()
    logging.info(f"Se encontraron {len(tickets)} tiquetes en total.")
    return tickets


# --- FUNCIÓN DE ESCRITURA UNIFICADA ---
async def save_new_ticket(
    db: AsyncSession,
    ticket_data: Ticket,
    existing_numbers: list[Number],
    new_number_strings: set[str],
    expiration_time: datetime | None = None
) -> Ticket:
    """
    Guarda un nuevo tiquete y actualiza/crea sus números.
    """
    logging.info(f"Iniciando guardado de tiquete ID: {ticket_data.id} con estado '{ticket_data.status}'.")
    db.add(ticket_data)
    
    target_status = "reserved" if ticket_data.status == "pending" else "assigned"
    
    # Actualizar números existentes
    if existing_numbers:
        logging.info(f"Actualizando {len(existing_numbers)} números existentes al estado '{target_status}'.")
        for num_obj in existing_numbers:
            num_obj.status = target_status
            num_obj.ticket_id = ticket_data.id
            num_obj.expire_at = expiration_time if ticket_data.status == "pending" else None

    # Crear números nuevos
    if new_number_strings:
        logging.info(f"Creando {len(new_number_strings)} nuevos números con estado '{target_status}'.")
        new_numbers_to_create = [
            Number(
                number=num_str,
                raffle_id=ticket_data.raffle_id,
                ticket_id=ticket_data.id,
                status=target_status,
                expire_at=expiration_time if ticket_data.status == "pending" else None
            )
            for num_str in new_number_strings
        ]
        db.add_all(new_numbers_to_create)

    logging.info(f"Tiquete y números listos para ser confirmados en la transacción.")
    return ticket_data


# --- FUNCIÓN DE CANCELACIÓN ---
async def cancel_ticket_and_release_numbers(db: AsyncSession, ticket: Ticket):
    """
    Actualiza el estado de un tiquete a 'cancelled' y libera sus números asociados.
    """
    logging.info(f"Cancelando tiquete ID: {ticket.id}.")
    ticket.status = "cancelled"
    if ticket.numbers:
        number_ids = [n.id for n in ticket.numbers]
        logging.info(f"Liberando {len(number_ids)} números asociados al tiquete.")
        await db.execute(
            update(Number)
            .where(Number.id.in_(number_ids))
            .values(status="available", ticket_id=None, expire_at=None)
        )

# --- FUNCIÓN DE CONFIRMACIÓN DE PAGO ---
async def confirm_ticket_payment(db: AsyncSession, ticket: Ticket):
    """
    Actualiza el estado de un tiquete a 'paid' y sus números a 'assigned'.
    """
    logging.info(f"Confirmando pago para tiquete ID: {ticket.id}.")
    ticket.status = "paid"
    ticket.payment_date = date.today() # Se establece la fecha de pago al día de hoy
    
    if ticket.numbers:
        number_ids = [n.id for n in ticket.numbers]
        logging.info(f"Actualizando {len(number_ids)} números a 'assigned'.")
        await db.execute(
            update(Number)
            .where(Number.id.in_(number_ids))
            .values(status="assigned", expire_at=None) # Se quita la expiración
        )
