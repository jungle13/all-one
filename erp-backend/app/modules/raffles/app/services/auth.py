# app/services/auth.py


from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Se importan los modelos y esquemas necesarios
from app.db.models import User
from app.schemas.user import UserCreate
from app.modules.raffles.app.core.security import get_password_hash # Asumiendo que esta función está en security.py

# --- Función Auxiliar para buscar usuarios ---
async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    """
    Busca un usuario por su nombre de usuario.
    """
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()


# --- Servicio para Crear un Nuevo Usuario ---
async def create_user_service(db: AsyncSession, user_data: UserCreate) -> User:
    """
    Crea un nuevo usuario en la base de datos, verificando que no exista previamente.
    """
    # 1. Verificar si el usuario ya existe
    existing_user = await get_user_by_username(db, user_data.username)
    if existing_user:
        # Es una buena práctica lanzar un error específico que el endpoint pueda capturar.
        raise ValueError("El nombre de usuario ya está en uso.")

    # 2. Hashear la contraseña antes de guardarla
    hashed_password = get_password_hash(user_data.password)

    # 3. Crear la instancia del modelo User
    # NOTA: No se asigna el 'id'. La base de datos lo genera automáticamente
    # porque es un Integer autoincremental. Esta es la corrección al plan original.
    new_user = User(
        username=user_data.username,
        hashed_password=hashed_password
    )

    # 4. Añadir a la sesión, confirmar y refrescar para obtener el ID asignado
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user