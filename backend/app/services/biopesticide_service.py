from typing import List, Optional
from app.schemas.biopesticide import BioPesticideItem, CommercialProductLink, BioPesticideQueryResponse

class BioPesticideService:
    """
    Curated Eco-Friendly Bio-Pesticide & Integrated Pest Management (IPM) Linker.
    Recommends ONLY organic biological controls with real-world e-commerce links.
    """

    CATALOG = [
        BioPesticideItem(
            id="bio_neem_10000",
            agent_name="Neem Oil (Azadirachtin 10,000 PPM)",
            category="Botanical Biopesticide",
            target_pests_diseases=["Whiteflies", "Aphids", "Jassids", "Leaf Miners", "Thrips"],
            dosage_and_application="2.0 - 2.5 ml per litre of water. Spray during evening hours.",
            safety_rating="100% Organic, Safe for Honeybees and Natural Predators",
            commercial_links=[
                CommercialProductLink(
                    marketplace_name="BigHaat",
                    product_title="Neem Gold 10000 PPM Organic Pest Controller (1 Litre)",
                    pack_size="1 Litre",
                    price_inr=590.0,
                    deep_link_url="https://www.bighaat.com/products/neem-gold-bio-pesticide"
                ),
                CommercialProductLink(
                    marketplace_name="AgriBegri",
                    product_title="EcoNeem 10000 PPM Pure Cold Pressed Bio-Protector",
                    pack_size="1 Litre",
                    price_inr=540.0,
                    deep_link_url="https://agribegri.com/products/econeem-bio-pesticide.php"
                ),
                CommercialProductLink(
                    marketplace_name="Amazon India",
                    product_title="Organic Azadirachtin 10000 PPM Neem Oil Concentrate",
                    pack_size="500 ml",
                    price_inr=380.0,
                    deep_link_url="https://www.amazon.in/s?k=neem+oil+10000+ppm+agriculture"
                )
            ]
        ),
        BioPesticideItem(
            id="bio_trichoderma",
            agent_name="Trichoderma Viride (Bio-Fungicide 1.5% W.P.)",
            category="Biological Anti-Fungal Inoculant",
            target_pests_diseases=["Root Rot (Pythium)", "Collar Rot", "Fusarium Wilt", "Damping-off"],
            dosage_and_application="Soil drenching: 10g per litre water. Soil application: 2.5 kg mixed with 100 kg compost per acre.",
            safety_rating="Non-toxic, Builds long-term rhizosphere microbial immunity",
            commercial_links=[
                CommercialProductLink(
                    marketplace_name="BigHaat",
                    product_title="Anand Agro Dr. Bacto's Dermus (Trichoderma Viride 1 Kg)",
                    pack_size="1 Kg",
                    price_inr=260.0,
                    deep_link_url="https://www.bighaat.com/products/trichoderma-viride-bio-fungicide"
                ),
                CommercialProductLink(
                    marketplace_name="AgriBegri",
                    product_title="Sanjeevani Trichoderma Viride Organic Root Protector",
                    pack_size="1 Kg",
                    price_inr=235.0,
                    deep_link_url="https://agribegri.com/products/trichoderma-viride-1kg.php"
                ),
                CommercialProductLink(
                    marketplace_name="Amazon India",
                    product_title="Eco-friendly Trichoderma Viride Bio-Fungicide Powder",
                    pack_size="1 Kg",
                    price_inr=280.0,
                    deep_link_url="https://www.amazon.in/s?k=trichoderma+viride+1kg"
                )
            ]
        ),
        BioPesticideItem(
            id="bio_beauveria",
            agent_name="Beauveria Bassiana (Entomopathogenic Fungi)",
            category="Bio-Insecticide",
            target_pests_diseases=["Stem Borer", "Helicoverpa (Pod Borer)", "Fall Armyworm", "Mealybugs"],
            dosage_and_application="5g per litre of water. Spray when pest larvae are in 1st/2nd instar stage.",
            safety_rating="Target-specific white muscardine fungus, Zero chemical residues",
            commercial_links=[
                CommercialProductLink(
                    marketplace_name="BigHaat",
                    product_title="Multiplex Baba (Beauveria Bassiana 1.15% WP) - 1 Kg",
                    pack_size="1 Kg",
                    price_inr=310.0,
                    deep_link_url="https://www.bighaat.com/products/multiplex-baba-beauveria-bassiana"
                ),
                CommercialProductLink(
                    marketplace_name="AgriBegri",
                    product_title="Utkarsh Beauverite Bio-Insecticide Powder",
                    pack_size="1 Kg",
                    price_inr=295.0,
                    deep_link_url="https://agribegri.com/products/beauveria-bassiana-1kg.php"
                )
            ]
        ),
        BioPesticideItem(
            id="bio_pseudomonas",
            agent_name="Pseudomonas Fluorescens (Bio-Bactericide)",
            category="Plant Growth Promoting Rhizobacteria (PGPR)",
            target_pests_diseases=["Bacterial Leaf Blight", "Sheath Blight in Paddy", "Canker"],
            dosage_and_application="Foliar spray: 5g per litre water. Seed treatment: 10g/kg seed.",
            safety_rating="Natural antagonist producing phenazine antibiotics",
            commercial_links=[
                CommercialProductLink(
                    marketplace_name="BigHaat",
                    product_title="Bio-Cure-B (Pseudomonas Fluorescens 1% WP) 1 Kg",
                    pack_size="1 Kg",
                    price_inr=275.0,
                    deep_link_url="https://www.bighaat.com/products/pseudomonas-fluorescens"
                ),
                CommercialProductLink(
                    marketplace_name="Amazon India",
                    product_title="Pseudomonas Fluorescens Bio Inoculant 1 Kg",
                    pack_size="1 Kg",
                    price_inr=299.0,
                    deep_link_url="https://www.amazon.in/s?k=pseudomonas+fluorescens+agriculture"
                )
            ]
        )
    ]

    @classmethod
    def get_recommendations_for_threat(cls, threat_type: str, crop_name: Optional[str] = None) -> BioPesticideQueryResponse:
        threat_lower = threat_type.lower()
        matched = []

        if "rot" in threat_lower or "hypoxia" in threat_lower or "damping" in threat_lower:
            matched = [cls.CATALOG[1], cls.CATALOG[3]] # Trichoderma & Pseudomonas
        elif "blight" in threat_lower or "leaf" in threat_lower:
            matched = [cls.CATALOG[3], cls.CATALOG[0]] # Pseudomonas & Neem
        elif "borer" in threat_lower or "insect" in threat_lower:
            matched = [cls.CATALOG[2], cls.CATALOG[0]] # Beauveria & Neem
        else:
            matched = cls.CATALOG # All

        return BioPesticideQueryResponse(
            query_context=f"Threat: {threat_type}",
            affected_crop=crop_name,
            recommended_bio_agents=matched
        )
