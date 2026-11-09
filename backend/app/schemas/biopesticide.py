from pydantic import BaseModel
from typing import List, Optional

class CommercialProductLink(BaseModel):
    marketplace_name: str # e.g. "AgriBegri", "BigHaat", "Amazon India"
    product_title: str
    pack_size: str
    price_inr: float
    deep_link_url: str
    is_in_stock: bool = True

class BioPesticideItem(BaseModel):
    id: str
    agent_name: str # e.g. "Neem Oil 10,000 PPM", "Trichoderma Viride", "Beauveria Bassiana"
    category: str # Botanical, Entomopathogenic Fungi, Bio-Fungicide, Pheromone Trap
    target_pests_diseases: List[str]
    dosage_and_application: str
    safety_rating: str # 100% Organic, Safe for Pollinators
    commercial_links: List[CommercialProductLink]

class BioPesticideQueryResponse(BaseModel):
    query_context: str
    affected_crop: Optional[str] = None
    recommended_bio_agents: List[BioPesticideItem]
