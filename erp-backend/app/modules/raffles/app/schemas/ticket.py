# app/schemas/ticket.py

from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import List, Optional
import enum

class PaymentType(str, enum.Enum):
    efectivo = "efectivo"
    transferencia = "transferencia"

# La clase ParticipantRequest ha sido eliminada.

# La clase FinalizeTicketRequest ha sido eliminada.

class ReservedNumber(BaseModel):
    id: int
    number: str
    model_config = ConfigDict(from_attributes=True)

# La clase ReservationResponse ha sido eliminada.

# La clase FinalizedTicketResponse ha sido eliminada.

class TicketCreateRequest(BaseModel):
    raffle_id: str
    numbers: List[str]
    name: str
    phone: str
    payment_type: PaymentType
    status: Optional[str] = "pending"  # Por defecto, el estado es 'pending'
    payment_date: Optional[date] = None
    payment_proof_url: Optional[str] = None

class TicketInfo(BaseModel):
    id: str
    name: str
    phone: str
    raffle_id: str
    status: str
    responsible: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]
    payment_type: Optional[PaymentType] = None
    payment_date: Optional[date] = None
    payment_proof_url: Optional[str] = None
    numbers: List[str]
    numbers_snapshot: Optional[List[str]] = None # <-- AÑADIR ESTA LÍNEA
    number_ids: List[int]
    raffle_name: str
    raffle_status: str
    raffle_short_id: str
    raffle_end_date: datetime
    raffle_price: float
    model_config = ConfigDict(from_attributes=True)

class TicketListResponse(BaseModel):
    tickets: List[TicketInfo]