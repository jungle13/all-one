# raffle-backend/app/api/v1/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.core.security import authenticate_user, create_access_token
# CAMBIO: Se importan los esquemas y servicios para el registro
from app.schemas.user import UserCreate, User
from app.modules.raffles.app.services.auth import create_user_service

router = APIRouter(prefix="/auth", tags=["Auth"])

# --- ENDPOINT DE LOGIN (Sin cambios) ---
@router.post("/token", summary="Create access token for user")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user = await authenticate_user(
        db=db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- ✅ ENDPOINT DE REGISTRO (AÑADIDO) ---
@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED, summary="Register a new user")
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Registra un nuevo usuario en el sistema.
    """
    try:
        new_user = await create_user_service(db, user_data)
        return new_user
    except ValueError as ve:
        # Captura el error si el usuario ya existe
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception:
        # Captura cualquier otro error inesperado
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al registrar el usuario.")
