from fastapi import APIRouter
from app.api.v1.endpoints import health, disease

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(disease.router, prefix="/disease", tags=["Disease Detection"])
