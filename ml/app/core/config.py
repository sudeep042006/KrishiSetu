import os
from pathlib import Path
from typing import List

# Base directory for the app
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PROJECT_NAME: str = "KrishiSetu Crop Disease ML Service"
    API_V1_STR: str = "/api/v1"
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    MODEL_DIR: Path = BASE_DIR / "models_store" / "crop_disease"
    MODEL_PATH: Path = MODEL_DIR / "best.pt"
    
    # Inference thresholds
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.40"))
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # LLM Settings (for disease advisory)
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "gemini-1.5-flash")

settings = Settings()

