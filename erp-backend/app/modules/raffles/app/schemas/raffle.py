# app/schemas/raffle.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

# --- Esquema para los tiquetes vendidos (información pública) ---
class SoldTicketInfo(BaseModel):
    id: str  # ID del tiquete para el enlace
    name: str
    numbers: List[str]
    status: str  # Estado real del tiquete
    created_at: datetime  # Fecha de compra
    responsible: Optional[str] = "N/A" # Vendedor responsable

    model_config = ConfigDict(from_attributes=True)

# --- Esquema para las estadísticas ---
class RaffleStatistics(BaseModel):
    tickets_sold: int
    total_tickets: int
    participants: int

# --- Esquema de respuesta de la Rifa (Base para las respuestas) ---
class RaffleResponse(BaseModel):
    id: str
    short_id: str
    name: str
    status: str
    description: Optional[str]
    end_date: datetime
    price: Optional[int]
    prize_cost: Optional[float] = None
    dijits_per_number: Optional[int] = None
    # --- CAMBIOS sutiles para alinear con el modelo ---
    numbers_per_ticket: int
    excluded_numbers: List[str]
    image_url: Optional[str]
    statistics: RaffleStatistics
    model_config = ConfigDict(from_attributes=True)

# --- Esquema para la lista de rifas ---
class RaffleListResponse(BaseModel):
    raffles: List[RaffleResponse]

# --- Esquema para crear una rifa ---
class RaffleCreateRequest(BaseModel):
    name: str
    dijits_per_number: int
    price: int
    end_date: datetime
    status: str
    description: Optional[str] = ""
    prize_cost: Optional[float] = None
    image_url: Optional[str] = ""
    # --- AJUSTE: Se añade un valor por defecto ---
    numbers_per_ticket: int = 1
    excluded_numbers: List[str] = []

# --- Esquema para actualizar una rifa ---
class RaffleUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    prize_cost: Optional[float] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    # --- CAMPOS AÑADIDOS ---
    # Se añaden los campos estructurales como opcionales para permitir su actualización.
    # La lógica de negocio en el servicio decidirá si se pueden modificar o no.
    dijits_per_number: Optional[int] = None
    numbers_per_ticket: Optional[int] = None
    excluded_numbers: Optional[List[str]] = None


# --- AJUSTE CRÍTICO: RaffleDetailResponse ahora HEREDA de RaffleResponse ---
class RaffleDetailResponse(RaffleResponse):
    # Ya no es necesario repetir todos los campos. Se heredan automáticamente.
    # Solo añadimos el campo extra que necesita esta vista detallada.
    sold_tickets: List[SoldTicketInfo]
    model_config = ConfigDict(from_attributes=True)