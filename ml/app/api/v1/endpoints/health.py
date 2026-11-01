from fastapi import APIRouter
from pathlib import Path
from app.core.config import settings

router = APIRouter()

@router.get("/health", summary="Health check")
def health_check():
    model_exists = Path(settings.MODEL_PATH).exists()
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "model_loaded": model_exists,
        "model_path": str(settings.MODEL_PATH)
    }
