from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float,
    Enum,
    Text,
    Boolean,
    JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base
from sqlalchemy.orm import Mapped, mapped_column
# Se importan los nuevos tipos de columna necesarios
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Date, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# Se importa el Enum que definimos en los esquemas para mantener la consistencia
from app.schemas.ticket import PaymentType
from app.db.base import Base
from sqlalchemy.dialects.postgresql import JSONB


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    raffles = relationship("Raffle", back_populates="owner")
    tickets = relationship("Ticket", back_populates="user")


class Raffle(Base):
    __tablename__ = "raffles"
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    short_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="open")
    price = Column(Integer)
    prize_cost = Column(Float, nullable=True, default=0.0)
    numbers_per_ticket = Column(Integer, default=1, nullable=False) # numbers per ticket
    dijits_per_number = Column(Integer)
    image_url = Column(String, nullable=True)
    excluded_numbers = Column(JSON, default=[], nullable=False) # Añadido campo para almacenar los números que no se venderán.O
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="raffles")
    tickets = relationship("Ticket", back_populates="raffle")
    numbers = relationship("Number", back_populates="raffle")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True)
    raffle_id = Column(String, ForeignKey("raffles.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="pending")
    name = Column(String(100)) # Longitud recomendada
    phone = Column(String(20)) # Longitud recomendada
    
    # ---  CAMPOS DE PAGO AÑADIDOS ---
    payment_type = Column(Enum(PaymentType, native_enum=False), nullable=True)
    payment_date = Column(Date, nullable=True)
    payment_proof_url = Column(String(255), nullable=True) # Longitud para URL

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    raffle = relationship("Raffle", back_populates="tickets")
    user = relationship("User", back_populates="tickets")
    numbers_snapshot = Column(JSONB) # Añadido para almacenar los números comprados en el ticket
    numbers = relationship("Number", back_populates="ticket", cascade="all, delete-orphan")


class Number(Base):
    __tablename__ = "numbers"

    id = Column(Integer, primary_key=True, index=True)
    raffle_id = Column(String, ForeignKey("raffles.id"), nullable=False)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=True)
    number = Column(String, nullable=False)
    status = Column(String, default="available", nullable=False)
    expire_at = Column(DateTime(timezone=True), nullable=True)

    ticket = relationship("Ticket", back_populates="numbers")
    raffle = relationship("Raffle")
