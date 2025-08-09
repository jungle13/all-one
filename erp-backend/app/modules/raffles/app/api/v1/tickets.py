# raffle-backend/app/api/v1/tickets.py

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date # Se añaden cast y Date
from sqlalchemy.orm import selectinload
from typing import List

from app.db.database import get_db
from app.core.security import get_current_user
from app.db.models import User, Ticket
from app.schemas.ticket import (
    TicketInfo,
    TicketListResponse,
    TicketCreateRequest, 
)
# Se importan los servicios simplificados
from app.services.ticket_service import (
    list_tickets_service,
    cancel_ticket_service,
    get_ticket_by_id_service,
    create_ticket_service,
    send_purchase_notification,
    confirm_payment_service,
)
from app.services.generate_image import generate_raffle_image
from app.modules.raffles.app.utils.cleanup import cleanup_temp_file
import tempfile
import os
import logging

from datetime import date

import shutil

router = APIRouter(prefix="/tickets", tags=["Tickets"])

# --- ENDPOINT DE CANCELACIÓN ÚNICO Y SIMPLIFICADO ---
# Este endpoint cancela un tiquete y libera sus números asociados.
# CAMBIO: Se usa un servicio para manejar la lógica de cancelación.
# CAMBIO: Se maneja la transacción de forma asíncrona.
@router.delete("/{ticket_id}/cancel", status_code=status.HTTP_200_OK, summary="Cancel a ticket and release its numbers")
async def cancel_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logging.info(f"Petición recibida en DELETE /tickets/{ticket_id}/cancel por el usuario '{current_user.username}'.")
    try:
        await cancel_ticket_service(ticket_id, db)
        logging.info(f"Tiquete {ticket_id} cancelado exitosamente.")
        return {"success": True, "message": f"Ticket {ticket_id} has been cancelled."}
    except ValueError as ve:
        logging.warning(f"Error 404 al cancelar tiquete {ticket_id}: {ve}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logging.error(f"Error 500 inesperado al cancelar tiquete {ticket_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")


@router.patch("/{ticket_id}/confirm-payment", status_code=status.HTTP_200_OK, summary="Confirm the payment of a pending ticket")
async def confirm_payment(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logging.info(f"Petición recibida en PATCH /tickets/{ticket_id}/confirm-payment por el usuario '{current_user.username}'.")
    try:
        await confirm_payment_service(ticket_id, db)
        logging.info(f"Pago del tiquete {ticket_id} confirmado exitosamente.")
        return {"success": True, "message": f"Payment for ticket {ticket_id} has been confirmed."}
    except ValueError as ve:
        logging.warning(f"Error 404/400 al confirmar pago del tiquete {ticket_id}: {ve}")
        # Puede ser 404 si no se encuentra, o 400 si el estado no es pending.
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logging.error(f"Error 500 inesperado al confirmar pago del tiquete {ticket_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")


@router.get("/", response_model=TicketListResponse, summary="List all tickets")
async def list_tickets(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    logging.info(f"Petición recibida en GET /tickets/ por el usuario '{current_user.username}'.")
    try:
        tickets = await list_tickets_service(db)
        logging.info(f"Devolviendo {len(tickets)} tiquetes.")
        return {"tickets": tickets}
    except Exception as e:
        logging.error(f"Error 500 inesperado al listar tiquetes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error listing tickets: {str(e)}")


@router.get("/{ticket_id}", response_model=TicketInfo, summary="Get a single ticket by ID")
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logging.info(f"Petición recibida en GET /tickets/{ticket_id} por el usuario '{current_user.username}'.")
    try:
        ticket = await get_ticket_by_id_service(ticket_id, db)
        if not ticket:
            logging.warning(f"Tiquete {ticket_id} no encontrado.")
            raise HTTPException(status_code=404, detail="Ticket not found")
        logging.info(f"Tiquete {ticket_id} encontrado y devuelto.")
        return ticket
    except Exception as e:
        logging.error(f"Error 500 inesperado al obtener tiquete {ticket_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting ticket: {str(e)}")


@router.post("/", response_model=TicketInfo, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    data: TicketCreateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea un nuevo tiquete pagado.
    """
    # ---  Log para ver exactamente qué datos llegan del frontend ---
    logging.info(f"Petición recibida en POST /tickets/ por el usuario '{current_user.username}'.")
    logging.info(f"Datos recibidos del frontend: {data.model_dump_json(indent=2)}")

    try:
        new_ticket_orm = await create_ticket_service(data, db, current_user)

        await db.refresh(new_ticket_orm, ['raffle'])

        if new_ticket_orm.status == 'paid':
            logging.info(f"Añadiendo tarea de fondo para enviar notificación de WhatsApp al tiquete {new_ticket_orm.id}.")
            background_tasks.add_task(
                send_purchase_notification, 
                db, # Se pasa la sesión a la tarea de fondo
                new_ticket_orm.phone, 
                new_ticket_orm.name, 
                new_ticket_orm.raffle_id,
                new_ticket_orm.id
            )

        raffle = new_ticket_orm.raffle
        formatted_response = TicketInfo(
            id=new_ticket_orm.id,
            name=new_ticket_orm.name,
            phone=new_ticket_orm.phone,
            raffle_id=new_ticket_orm.raffle_id,
            status=new_ticket_orm.status,
            responsible=new_ticket_orm.user.username if new_ticket_orm.user else None,
            created_at=new_ticket_orm.created_at,
            updated_at=new_ticket_orm.updated_at,
            payment_type=new_ticket_orm.payment_type,
            payment_date=new_ticket_orm.payment_date,
            payment_proof_url=new_ticket_orm.payment_proof_url,
            numbers=[n.number for n in new_ticket_orm.numbers],
            number_ids=[n.id for n in new_ticket_orm.numbers],
            raffle_name=raffle.name,
            raffle_status=raffle.status,
            raffle_short_id=raffle.short_id,
            raffle_end_date=raffle.end_date,
            raffle_price=raffle.price
        )
        
        logging.info(f"Tiquete {formatted_response.id} creado exitosamente. Enviando respuesta al frontend.")
        return formatted_response

    except ValueError as ve:
        logging.warning(f"Error de validación (400) al crear tiquete: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Error inesperado (500) al crear tiquete: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error al crear el tiquete: {str(e)}")


# --- ENDPOINT PARA GENERAR IMAGEN DEL TIQUETE ---
# CAMBIO: Se crea un endpoint para generar una imagen del tiquete.
# CAMBIO: Se usa una función de generación de imagen y se maneja la limpieza del archivo temporal.
# CAMBIO: Se devuelve la imagen generada como FileResponse.
@router.get("/{ticket_id}/image", summary="Genera una imagen para un tiquete específico")
async def get_ticket_image(
    ticket_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene los datos de un tiquete y su rifa asociada para generar una imagen
    visual que sirve como comprobante para el comprador.
    """
    temp_path = None
    try:
        # La consulta a la base de datos ya es eficiente y está bien
        query = (
            select(Ticket)
            .options(selectinload(Ticket.raffle), selectinload(Ticket.numbers))
            .where(Ticket.id == ticket_id)
        )
        result = await db.execute(query)
        ticket = result.scalars().first()

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        # --- DICCIONARIO AJUSTADO CON LA INFORMACIÓN COMPLETA ---
        ticket_data_for_image = {
            "ticket_id": ticket.id,
            "buyer_name": ticket.name,
            "raffle_name": ticket.raffle.name,
            
            # Ajuste: Usamos payment_date para mayor precisión y lo formateamos.
            "purchase_date": ticket.payment_date.strftime("%d de %B de %Y") if ticket.payment_date else "N/A",
            
            # Nuevo: Añadimos la fecha del sorteo, también formateada.
            "draw_date": ticket.raffle.end_date.strftime("%d de %B de %Y") if ticket.raffle.end_date else "Por definir",

            # Ajuste: El total pagado es el precio de la rifa.
            "total_price": ticket.raffle.price,

            # Esto ya estaba correcto.
            "numbers": [n.number for n in ticket.numbers]
        }
        # --- FIN DE LOS AJUSTES ---

        # El resto de la función para generar el archivo y devolverlo es correcta.
        img = generate_raffle_image(ticket_data_for_image)
        
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
            temp_path = temp_file.name
            img.save(temp_path, "JPEG", quality=95)
        
        background_tasks.add_task(cleanup_temp_file, temp_path)
        
        return FileResponse(
            temp_path,
            media_type="image/jpeg",
            filename=f"Rifa_{ticket.raffle.name.replace(' ', '_')}_Ticket_{ticket.id[:8]}.jpg"
        )
        
    except Exception as e:
        # El manejo de errores y limpieza de archivos temporales es correcto.
        if temp_path and os.path.exists(temp_path):
            cleanup_temp_file(temp_path)
        # Es buena idea loggear el error real para debugging
        # logging.error(f"Error al generar imagen para ticket {ticket_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno al generar la imagen: {str(e)}")
    

# --- NUEVO ENDPOINT PARA SUBIR COMPROBANTE ---
@router.patch("/{ticket_id}/proof", response_model=TicketInfo, summary="Upload a payment proof for a ticket")
async def upload_payment_proof(
    ticket_id: str,
    proof_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sube un archivo de comprobante de pago para un tiquete y actualiza su URL.
    """
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Lógica de guardado de archivo (simplificada para guardar localmente)
    # En producción, esto debería subir a un servicio como S3, Cloudinary, etc.
    file_extension = proof_file.filename.split('.')[-1]
    if file_extension.lower() not in ['jpg', 'jpeg', 'png']:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Only JPG and PNG are allowed.")
        
    file_path = f"uploads/proofs/{ticket_id}_{proof_file.filename}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(proof_file.file, buffer)
        
    # La URL sería la ruta relativa para acceder al archivo desde el frontend
    # Asegúrate de que la carpeta 'uploads' sea servida estáticamente por tu servidor
    ticket.payment_proof_url = f"/{file_path}"
    
    await db.commit()
    await db.refresh(ticket)
    
    # Reutiliza el servicio existente para devolver la información completa del tiquete
    return await get_ticket_by_id_service(ticket_id, db)

# --- NUEVO ENDPOINT PARA ELIMINAR COMPROBANTE ---
@router.delete("/{ticket_id}/proof", response_model=TicketInfo, summary="Delete the payment proof for a ticket")
async def delete_payment_proof(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Elimina la URL del comprobante de pago de un tiquete.
    """
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Aquí también deberías eliminar el archivo físico del servidor
    # if ticket.payment_proof_url and os.path.exists(ticket.payment_proof_url.strip('/')):
    #     os.remove(ticket.payment_proof_url.strip('/'))

    ticket.payment_proof_url = None
    await db.commit()
    await db.refresh(ticket)

    return await get_ticket_by_id_service(ticket_id, db)


# --- ENDPOINT PARA DATOS DEL DASHBOARD (VERSIÓN CORREGIDA) ---
@router.get("/sales/monthly_summary", summary="Get sales summary for the current month by user")
async def get_monthly_sales_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve un resumen de los tiquetes 'paid' vendidos en el mes actual,
    agrupados por día de PAGO y por vendedor (usuario).
    """
    today = date.today()
    start_of_month = today.replace(day=1)

    # --- CONSULTA AJUSTADA ---
    # Ahora se selecciona, agrupa y filtra usando 'Ticket.payment_date'.
    # Como 'payment_date' ya es de tipo Date, no se necesita el 'cast'.
    query = (
        select(
            Ticket.payment_date.label('sale_date'),
            User.username.label('seller'),
            func.count(Ticket.id).label('tickets_sold')
        )
        .join(User, Ticket.user_id == User.id)
        .where(
            Ticket.status == 'paid',
            Ticket.payment_date != None,  # Se añade filtro para evitar fechas nulas
            Ticket.payment_date >= start_of_month
        )
        .group_by(
            Ticket.payment_date,
            User.username
        )
        .order_by(Ticket.payment_date)
    )
    # --- FIN DEL AJUSTE ---

    result = await db.execute(query)
    sales_data = [row._asdict() for row in result.all()]
    
    return sales_data