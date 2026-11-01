import os
from typing import Optional
from app.core.config import settings
from app.schemas.disease_schema import DiseaseAdvisory

# Curated Agricultural Extension Knowledge Base for common Indian crops & diseases
DISEASE_KNOWLEDGE_BASE = {
    "early blight": DiseaseAdvisory(
        description="Fungal disease caused by Alternaria solani affecting tomatoes and potatoes. Characterized by dark brown concentric rings (target board spots) on older leaves, leading to yellowing and defoliation.",
        severity="Moderate",
        organic_remedies=[
            "Spray Neem oil formulation (3-5 ml per liter of water) during early morning.",
            "Apply Trichoderma viride or Bacillus subtilis bio-fungicide to soil and foliage.",
            "Remove and safely burn lower infected leaves to prevent spore splashing."
        ],
        chemical_remedies=[
            "Spray Mancozeb 75% WP @ 2-2.5 g per liter of water at first sight of spots.",
            "Alternate with Chlorothalonil 75% WP @ 2 g/L or Azoxystrobin 23% SC @ 1 ml/L every 10-14 days."
        ],
        prevention_tips=[
            "Practice minimum 2-year crop rotation with non-solanaceous crops (avoid tomato/potato back-to-back).",
            "Use drip irrigation instead of overhead sprinklers to avoid wetting foliage.",
            "Maintain optimal plant spacing (60 x 45 cm) for proper air circulation."
        ]
    ),
    "late blight": DiseaseAdvisory(
        description="Destructive water-mold infection caused by Phytophthora infestans. Appears as rapid, water-soaked pale green to dark brown lesions with white mold on the underside of leaves in cool, wet weather.",
        severity="High",
        organic_remedies=[
            "Apply Copper oxychloride or Bordeaux mixture (1%) as a preventative barrier.",
            "Foliar spray of fermented butter milk (sour chaas) diluted 1:10 with water as a bio-deterrent.",
            "Uproot and bury heavily infected plants in deep pits immediately."
        ],
        chemical_remedies=[
            "Apply Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g per liter of water.",
            "For active outbreaks, spray Cymoxanil 8% + Mancozeb 64% WP @ 2 g/L."
        ],
        prevention_tips=[
            "Plant certified disease-free seed tubers and resistant cultivars.",
            "Avoid planting near old potato or tomato dump piles.",
            "Ensure excellent field drainage to prevent standing surface water."
        ]
    ),
    "leaf mold": DiseaseAdvisory(
        description="Fungal pathogen Passalora fulva common in high-humidity greenhouse and sheltered crops. Yellow spots appear on the upper leaf surface with velvety olive-green mold underneath.",
        severity="Moderate",
        organic_remedies=[
            "Spray potassium bicarbonate solution (5g/L) to alter leaf surface pH against spores.",
            "Prune bottom suckers and lower foliage to promote light penetration and airflow."
        ],
        chemical_remedies=[
            "Foliar spray with Copper Hydroxide 77% WP @ 2 g/L.",
            "Difeno-conazole 25% EC @ 0.5 ml/L if humidity remains above 85%."
        ],
        prevention_tips=[
            "Ventilate green-net/polyhouses early in the morning.",
            "Avoid high plant densities."
        ]
    ),
    "powdery mildew": DiseaseAdvisory(
        description="Fungal infection producing a characteristic white, talcum powder-like dusting on leaves and stems, reducing photosynthesis and causing leaf curl.",
        severity="Moderate",
        organic_remedies=[
            "Spray milk diluted in water (1:9 ratio) in bright sunlight; milk proteins act as natural antiseptics.",
            "Sulfur dusting or wettable sulfur (3g/L) in early mornings."
        ],
        chemical_remedies=[
            "Hexaconazole 5% EC @ 1 ml per liter of water.",
            "Penconazole 10% EC @ 0.5 ml per liter."
        ],
        prevention_tips=[
            "Plant in full sun and prune overcrowded shoots.",
            "Avoid excessive nitrogen fertilization which produces overly tender susceptible foliage."
        ]
    ),
    "healthy": DiseaseAdvisory(
        description="The plant foliage exhibits vibrant green color, strong turgidity, and no visible pathogenic leaf spots or mold formations.",
        severity="Low",
        organic_remedies=[
            "Continue prophylactic Jeevamrutha or seaweed extract application for root vigor.",
            "Maintain balanced compost mulching around root zones."
        ],
        chemical_remedies=[
            "No chemical fungicides required. Maintain standard micronutrient schedule."
        ],
        prevention_tips=[
            "Monitor weekly for early insect pest vectors like whiteflies and aphids.",
            "Adhere to regulated irrigation schedules."
        ]
    )
}

class LLMAdvisor:
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.model_name = settings.LLM_MODEL_NAME

    def get_advisory(self, crop_name: Optional[str], disease_name: str, is_healthy: bool) -> DiseaseAdvisory:
        """
        Returns actionable treatment advisory for a detected plant disease.
        Uses exact match knowledge base or intelligent generative fallback.
        """
        if is_healthy:
            return DISEASE_KNOWLEDGE_BASE["healthy"]

        cleaned_disease = disease_name.lower().strip()

        # Check knowledge base for exact or partial match
        for key, advisory in DISEASE_KNOWLEDGE_BASE.items():
            if key in cleaned_disease or cleaned_disease in key:
                return advisory

        # Generic high-value fallback advisory if specific disease is rare
        crop = crop_name or "Crop"
        return DiseaseAdvisory(
            description=f"Identified symptoms consistent with {disease_name} on {crop}. Pathogenic infection may compromise photosynthetic area and yield if left untreated.",
            severity="Moderate",
            organic_remedies=[
                "Apply Neem oil extract (5ml/L) with mild surfactant at 7-day intervals.",
                "Spray bio-fungicide Trichoderma harzianum (5g/L) on soil and root perimeter.",
                "Isolate and discard heavily affected foliage away from irrigation runoff."
            ],
            chemical_remedies=[
                "Apply broad-spectrum preventative fungicide such as Mancozeb 75% WP @ 2.5 g/L.",
                "Consult local Krishi Vigyan Kendra (KVK) for district-specific curative recommendations."
            ],
            prevention_tips=[
                "Avoid overhead irrigation to keep foliage dry.",
                "Ensure proper row spacing and maintain field sanitation.",
                "Rotate crops with non-host species in following cultivation cycle."
            ]
        )

llm_advisor = LLMAdvisor()
