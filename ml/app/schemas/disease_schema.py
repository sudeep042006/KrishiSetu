from typing import List, Optional
from pydantic import BaseModel, Field

class DiseaseAdvisory(BaseModel):

    description: str = Field(..., description="Break description of the Disease and Causes")
    severity:str = Field(..., description="Severity levels low moderate or hight")
    organic_remedies: List[str] = Field(default_factory=list, description="Natural remedies for this")
    chemical_remedies: List[str] = Field(default_factory=list, description="Whatever the chemical remedies are")
    prevention_tips: list[str] = Field(default_factory=list, description="Practices to prevent this disease in next season(crop rotationm spacing)")


class DiseasePrediction(BaseModel):
    crop_name: Optional[str] = Field(default=None, description="Plant identified eg tomato potato rice")
    disease_name: str = Field(..., description="Name of the detected condition" )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model probability")
    is_healthy: bool = Field(default=False, description="True if no disease was detected")

class DiseaseAnalysisResponse(BaseModel):

    success: bool = True
    message: str = "Analysis completed successfully"
    prediction: Optional[DiseasePrediction] = None
    advisory: Optional[DiseaseAdvisory] = None

