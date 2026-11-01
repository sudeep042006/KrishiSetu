from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.services.disease_detector import disease_detector
from app.services.llm_advisor import llm_advisor
from app.schemas.disease_schema import DiseaseAnalysisResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

@router.post(
    "/predict",
    response_model=DiseaseAnalysisResponse,
    summary="Diagnose crop leaf disease from image"
)
async def predict_crop_disease(file: UploadFile = File(...)):
    # 1. Validate file format
    filename = file.filename or "image.jpg"
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format: .{extension}. Please upload JPG, PNG, or WEBP."
        )

    # 2. Read bytes
    try:
        contents = await file.read()
        if not contents or len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        # 3. Predict disease using YOLO
        prediction = disease_detector.predict(contents)

        # 4. Generate structured advisory
        advisory = llm_advisor.get_advisory(
            crop_name=prediction.crop_name,
            disease_name=prediction.disease_name,
            is_healthy=prediction.is_healthy
        )

        return DiseaseAnalysisResponse(
            success=True,
            message="Disease analysis complete",
            prediction=prediction,
            advisory=advisory
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during disease prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}"
        )
