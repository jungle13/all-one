from fastapi import APIRouter
from .auth import router as auth_router
from .raffles import router as raffles_router
from .tickets import router as ticket_router

router = APIRouter(prefix="/api/v1")
router.include_router(auth_router)
router.include_router(raffles_router)
router.include_router(ticket_router)
