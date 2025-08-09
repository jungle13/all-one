# raffle-backend/app/api/v1/raffles.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user
from app.db.models import User
# --- LÍNEA MODIFICADA ---
# Se importan todos los esquemas y servicios necesarios
from app.schemas.raffle import RaffleCreateRequest, RaffleListResponse, RaffleUpdateRequest, RaffleResponse
from app.services.raffle_service import create_raffle_service, list_raffles_service, update_raffle_service, get_raffle_service, check_number_availability_service, get_random_available_numbers_service, _build_raffle_response
from app.modules.raffles.app.schemas.raffle import RaffleDetailResponse
# -------------------------

router = APIRouter(prefix="/raffle", tags=["Raffles"])

# --- ENDPOINT PARA CREAR UNA NUEVA RIFA ---
# Este endpoint permite a los usuarios crear una nueva rifa.
# Utiliza el servicio para manejar la lógica de negocio y devuelve la rifa creada.
@router.post("/create", response_model=RaffleResponse, status_code=status.HTTP_201_CREATED)
async def create_raffle(
    data: RaffleCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. El servicio crea la rifa y devuelve el objeto ORM
        new_raffle_orm = await create_raffle_service(data, db, current_user)
    
        # --- AJUSTE CLAVE ---
        # 2. Construimos la respuesta formateada usando la función auxiliar.
        #    Para una rifa nueva, las estadísticas son siempre 0.
        formatted_response = _build_raffle_response(
            raffle=new_raffle_orm,
            tickets_sold=0,
            participants=0
        )
        
        # 3. Devolvemos la respuesta ya formateada y completa
        return formatted_response
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating raffle: {str(e)}")


@router.get("/", response_model=RaffleListResponse)
async def list_raffles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        raffles = await list_raffles_service(db)
        return {"raffles": raffles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing raffles: {str(e)}")

# --- ENDPOINT PARA OBTENER DETALLES DE UNA RIFA ---
# Este endpoint permite obtener los detalles de una rifa específica por su ID.
# Devuelve un objeto RaffleDetailResponse con toda la información relevante.
@router.get("/{raffle_id}", response_model=RaffleDetailResponse)
async def get_raffle(
    raffle_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        raffle = await get_raffle_service(raffle_id, db)
        return raffle
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting raffle: {str(e)}")
    
# --- ENDPOINT DE ACTUALIZACIÓN CORREGIDO Y SIMPLIFICADO ---
@router.put("/{raffle_id}", response_model=RaffleDetailResponse)
async def update_raffle(
    raffle_id: str,
    raffle_data: RaffleUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualiza una rifa existente. Devuelve la rifa actualizada.
    """
    try:
        # El servicio ya devuelve el objeto Raffle actualizado y compatible
        updated_raffle_orm = await update_raffle_service(raffle_id, raffle_data, db)
        
        # FastAPI y Pydantic se encargarán de convertir el objeto ORM a la respuesta JSON
        return updated_raffle_orm
        
    except ValueError as e:
        # Si la rifa no se encuentra o hay un error de validación, devuelve 400 o 404
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # Para cualquier otro error inesperado
        raise HTTPException(status_code=500, detail=f"Error updating raffle: {str(e)}")
    

# --- ENDPOINT PARA VERIFICAR DISPONIBILIDAD DE NÚMERO ---
# Este endpoint permite verificar si un número específico está disponible para una rifa.
# Devuelve 'true' si el número está disponible, 'false' si está ocupado o excluido.
@router.get("/{raffle_id}/check-number/{number_str}", summary="Check if a number is available")
async def check_number_availability(
    raffle_id: str,
    number_str: str,
    db: AsyncSession = Depends(get_db),
    # La protección con 'get_current_user' es opcional. Si la dejas, solo usuarios
    # logueados podrán verificar números. Si la quitas, será una consulta pública.
    current_user: User = Depends(get_current_user) 
):
    """
    Verifica si un número específico está disponible para una rifa dada.
    Devuelve 'true' si está disponible, 'false' si está ocupado o excluido.
    """
    try:
        # 1. Llama al servicio que contiene la lógica de negocio
        is_available = await check_number_availability_service(raffle_id, number_str, db)
        
        # 2. Devuelve la respuesta en formato JSON
        return {"is_available": is_available}

    except Exception as e:
        # 3. Maneja cualquier error inesperado
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error al verificar la disponibilidad del número: {str(e)}"
        )
    

# --- ENDPOINT PARA OBTENER NÚMEROS ALEATORIOS DISPONIBLES ---
# Este endpoint genera y devuelve una lista de N números aleatorios disponibles para una rifa.
# Utiliza el servicio para obtener los números y maneja errores comunes.
@router.get("/{raffle_id}/random-numbers/{count}", summary="Get a list of random available numbers")
async def get_random_available_numbers(
    raffle_id: str,
    count: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Genera y devuelve una lista de N (`count`) números aleatorios disponibles para una rifa.
    """
    try:
        numbers = await get_random_available_numbers_service(raffle_id, count, db)
        return {"numbers": numbers}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))