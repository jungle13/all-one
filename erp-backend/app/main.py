# erp-backend/app/main.py (Versión Corregida)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Ajuste de importaciones para la nueva estructura
from app.modules.users.api import router as users_router
from app.modules.raffles.app.api.v1 import router as raffles_router
# En el futuro, añadirá más routers aquí:
# from app.modules.inventory.api import router as inventory_router

app = FastAPI(
    title="ERP System API",
    description="API para el sistema ERP modular.",
    version="1.0.0"
)

# Configuración de CORS (se mantiene igual)
origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de los routers modulares
app.include_router(users_router, prefix="/api/v1/users", tags=["Users & Auth"])
app.include_router(raffles_router, prefix="/api/v1/raffles", tags=["Raffles"])
# En el futuro, registrará los nuevos módulos aquí:
# app.include_router(inventory_router, prefix="/api/v1/inventory", tags=["Inventory"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the ERP API"}