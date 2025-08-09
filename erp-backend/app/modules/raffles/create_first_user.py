import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone

# --- Importaciones Adicionales ---
from app.db.database import async_session_local
from app.db.models import User, Raffle # <-- Se importa el modelo Raffle
from app.core.security import get_password_hash
from app.services.raffle_service import generate_short_id # <-- Se importa el generador de short_id

# --- Configuración ---
USERS_TO_CREATE = [
    {"username": "admin", "password": "admin123"},
    {"username": "vendedor", "password": "vendedor123"}
]
ADMIN_USERNAME = "admin" # Define quién será el dueño de la rifa de prueba

async def seed_database():
    """
    Crea los usuarios y una rifa de prueba, solo si no existen previamente.
    """
    print("🚀 Iniciando la siembra de datos de prueba...")
    
    async with async_session_local() as session:
        async with session.begin():
            # --- Creación de Usuarios ---
            admin_user = None
            print("\n--- Creando Usuarios ---")
            for user_data in USERS_TO_CREATE:
                username = user_data["username"]
                result = await session.execute(select(User).where(User.username == username))
                existing_user = result.scalars().first()
                
                if not existing_user:
                    hashed_password = get_password_hash(user_data["password"])
                    new_user = User(username=username, hashed_password=hashed_password)
                    session.add(new_user)
                    print(f"✅ Usuario '{username}' preparado para ser creado.")
                    if username == ADMIN_USERNAME:
                        await session.flush() # Hacemos flush para obtener el ID del admin
                        admin_user = new_user
                else:
                    print(f"👍 Usuario '{username}' ya existe.")
                    if username == ADMIN_USERNAME:
                        admin_user = existing_user

            # --- Creación de Rifa de Prueba ---
            print("\n--- Creando Rifa de Prueba ---")
            if not admin_user:
                print("❌ No se puede crear la rifa porque el usuario 'admin' no existe y no pudo ser creado.")
                return # Salimos si no tenemos un admin

            raffle_name = "Gran Rifa de Lanzamiento"
            result = await session.execute(select(Raffle).where(Raffle.name == raffle_name))
            existing_raffle = result.scalars().first()

            if not existing_raffle:
                while True:
                    short_id = generate_short_id()
                    result = await session.execute(select(Raffle).where(Raffle.short_id == short_id))
                    if result.scalars().first() is None:
                        break
                
                new_raffle = Raffle(
                    id=str(uuid.uuid4()),
                    short_id=short_id,
                    name=raffle_name,
                    description="Participa en nuestra primera gran rifa y gana premios increíbles.",
                    status="active",
                    end_date=datetime.now(timezone.utc) + timedelta(days=30),
                    price=5000.0,
                    dijits_per_number=4,
                    numbers_per_ticket=1,
                    excluded_numbers=[],
                    owner_id=admin_user.id
                )
                session.add(new_raffle)
                print(f"✅ Rifa '{raffle_name}' preparada para ser creada.")
            else:
                print(f"👍 La rifa '{raffle_name}' ya existe.")
                
    print("\n🎉 Proceso de siembra de datos finalizado.")

if __name__ == "__main__":
    try:
        asyncio.run(seed_database())
    except Exception as e:
        print(f"Ocurrió un error durante la siembra de datos: {e}")