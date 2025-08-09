from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext # <-- AÑADIDO
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

# NUEVO: Importaciones necesarias para la BD y la configuración central
from app.core.config import settings
from app.db.database import get_db
from app.db.models import User

# --- CONFIGURACIÓN DE PASSLIB ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña plana contra su hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)
# ---------------------------------

# La URL del token ahora se construye con la ruta de la API desde la configuración
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")


# MODIFICADO: La función ahora es asíncrona y consulta la BD real
async def get_user(db: AsyncSession, username: str) -> Optional[User]:
    """
    Obtiene un usuario de la base de datos por su nombre de usuario.
    """
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()


# MODIFICADO: Ahora es asíncrona para poder llamar a get_user
async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
    """
    Autentica un usuario. Si es exitoso, devuelve el objeto User.
    """
    user = await get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None  # Se devuelve None en lugar de False para más claridad
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un nuevo token de acceso.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Usamos el valor de la configuración
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    # Usamos los valores de la configuración
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


# MODIFICADO: Ahora depende de la sesión de la BD y consulta la BD real
async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Decodifica el token JWT para obtener el usuario actual.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Usamos los valores de la configuración
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user(db, username) # Se consulta la BD real
    if user is None:
        raise credentials_exception
    return user