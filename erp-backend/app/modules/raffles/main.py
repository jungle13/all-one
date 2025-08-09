from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine
from app.db.base import Base 
import app.db.models as models
from app.api.v1 import router as api_router
from fastapi.staticfiles import StaticFiles
import os
from app.modules.raffles.app.api.v1.uploads import router as uploads_router

app = FastAPI(title=settings.PROJECT_NAME)



# Asegúrate de que la carpeta 'uploads' exista en la raíz de 'raffle-backend'
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Evento de startup para crear tablas
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        # Esto imprimirá el SQL que se ejecutará
        print("Dropping and recreating tables...")
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all, checkfirst=True)
    print("Database tables created")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow requests from the frontend
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include the API router
app.include_router(api_router)
app.include_router(uploads_router, prefix="/api/v1") # Añade el prefijo de la API

def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()


# class Participant(BaseModel):
#     name: str
#     phone: str
#     numbers: List[str]


# class VerifyRequest(BaseModel):
#     number: str


# @app.get("/api/raffles")
# def get_raffles():
#     # Logic to fetch raffles from CSV or database
#     return {
#         "raffles": [
#             {
#                 "id": 1,
#                 "name": "Rifa 1",
#                 "description": "Rifa 1 description",
#                 "status": "active",
#             },
#             {
#                 "id": 2,
#                 "name": "Rifa 2",
#                 "description": "Rifa 2 description",
#                 "status": "active",
#             },
#             {
#                 "id": 3,
#                 "name": "Rifa 3",
#                 "description": "Rifa 3 description",
#                 "status": "active",
#             },
#         ]
#     }


# @app.post("/api/raffles/register")
# def register_participant(participant: Participant):
#     # Logic to register a participant
#     return {"success": True, "message": "Registration completed successfully"}


# @app.post("/api/raffles/verify")
# def verify_number(request: VerifyRequest):
    # Logic to verify a number
    # return {
    #     "success": True,
    #     "message": "Number verified successfully",
    #     "additional_numbers": [],
    # }
