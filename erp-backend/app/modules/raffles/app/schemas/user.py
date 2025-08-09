# raffle-backend/app/schemas/user.py

from pydantic import BaseModel

# ✅ ESQUEMA AÑADIDO: Define la estructura para crear un nuevo usuario.
class UserCreate(BaseModel):
    username: str
    password: str

# Puedes añadir aquí otros esquemas de User si los necesitas, por ejemplo, para las respuestas del API.
class User(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True