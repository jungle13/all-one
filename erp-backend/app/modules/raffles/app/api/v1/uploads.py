# raffle-backend/app/api/v1/uploads.py
import os
import shutil
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, status

router = APIRouter(prefix="/uploads", tags=["Uploads"])

# Crea el directorio si no existe
os.makedirs("uploads/proofs", exist_ok=True)

@router.post("/proof", summary="Upload a generic proof file")
async def upload_generic_proof(upload_file: UploadFile = File(...)):
    """
    Recibe un archivo, lo guarda con un nombre único y devuelve su URL de acceso.
    """
    file_extension = upload_file.filename.split('.')[-1]
    if file_extension.lower() not in ['jpg', 'jpeg', 'png']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Tipo de archivo inválido. Solo se permiten JPG y PNG."
        )
        
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/proofs/{unique_filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"No se pudo guardar el archivo: {e}"
        )
    
    # Devuelve la URL relativa que el frontend usará para acceder al archivo
    return {"url": f"/{file_path}"}