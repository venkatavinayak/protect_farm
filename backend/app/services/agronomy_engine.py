from typing import Dict, Any, List
from app.schemas.threat import CropThreatAssessment, MitigationStep

class AgronomyEngine:
    """
    Evaluates weather impact strictly against Crop Water Requirements (CWR)
    and phenological susceptibility matrices.
    """

    CROP_METADATA = {
        "paddy": {"category": "wetland", "optimal_water_mm_day": 8.0, "tolerance": "high"},
        "rice": {"category": "wetland", "optimal_water_mm_day": 8.0, "tolerance": "high"},
        "groundnut": {"category": "arid_pulse", "optimal_water_mm_day": 3.0, "tolerance": "very_low"},
        "chickpea": {"category": "arid_pulse", "optimal_water_mm_day": 2.5, "tolerance": "very_low"},
        "green gram": {"category": "arid_pulse", "optimal_water_mm_day": 2.5, "tolerance": "very_low"},
        "black gram": {"category": "arid_pulse", "optimal_water_mm_day": 2.5, "tolerance": "very_low"},
        "cotton": {"category": "cash_crop", "optimal_water_mm_day": 4.5, "tolerance": "moderate"},
        "tomato": {"category": "horticulture", "optimal_water_mm_day": 4.0, "tolerance": "low"},
        "chilli": {"category": "horticulture", "optimal_water_mm_day": 3.5, "tolerance": "low"},
        "banana": {"category": "tall_stalk", "optimal_water_mm_day": 6.5, "tolerance": "moderate"},
        "sugarcane": {"category": "tall_stalk", "optimal_water_mm_day": 7.0, "tolerance": "high"},
        "maize": {"category": "tall_stalk", "optimal_water_mm_day": 5.0, "tolerance": "moderate"},
    }

    @classmethod
    def assess_crop_threat(
        cls,
        crop_id: int,
        crop_name: str,
        growth_stage: str,
        rainfall_24h_mm: float,
        wind_speed_kmh: float,
        temperature_c: float
    ) -> CropThreatAssessment:
        normalized_name = crop_name.lower().strip()
        meta = cls.CROP_METADATA.get(normalized_name, {"category": "general", "tolerance": "moderate"})
        category = meta["category"]

        threat_level = "SAFE"
        threat_type = "Normal_Growing_Conditions"
        is_dangerous = False
        summary_msg = f"{crop_name} is in a stable, normal weather zone."
        bio_explanation = f"Current forecast of {rainfall_24h_mm}mm rain and {wind_speed_kmh}km/h wind is within the physiological tolerance of {crop_name}."
        mitigation_steps = []

        # =========================================================================
        # 1. WETLAND CROPS (Paddy / Rice)
        # Moderate rain is beneficial during vegetative/tillering.
        # Cyclones or water submergence during flowering causes flower wash & lodging.
        # =========================================================================
        if category == "wetland":
            if wind_speed_kmh >= 45.0:
                threat_level = "CRITICAL"
                threat_type = "Lodging_and_Panicle_Shattering"
                is_dangerous = True
                summary_msg = f"High Wind Alert ({wind_speed_kmh} km/h): Risk of mechanical lodging for {crop_name}."
                bio_explanation = (
                    f"Strong cyclonic gusts exert severe lateral torque on the flexible culms (stems) of {crop_name}, "
                    f"especially in the {growth_stage} stage, snapping tillers and shattering grain panicles."
                )
                mitigation_steps = [
                    MitigationStep(
                        step_number=1,
                        timing_window="Next 6 Hours",
                        action_title="Lower Standing Water to 2-3 cm",
                        action_description="Drain excess deep water from bunds. Shallow standing water provides firmer root anchoring against wind torque."
                    ),
                    MitigationStep(
                        step_number=2,
                        timing_window="During Gale Event",
                        action_title="Clear Field Spillways",
                        action_description="Ensure surplus water escape weirs are debris-free to avoid sudden bund breaching."
                    ),
                    MitigationStep(
                        step_number=3,
                        timing_window="Within 48 Hours Post-Event",
                        action_title="Prophylactic Bio-Bactericide Spray",
                        action_description="Spray Pseudomonas fluorescens (5g/L) to prevent Bacterial Leaf Blight entering through wind-inflicted leaf lacerations."
                    )
                ]
            elif rainfall_24h_mm >= 75.0 and growth_stage.lower() in ["flowering", "tillering"]:
                threat_level = "WARNING"
                threat_type = "Panicle_Submergence_and_Pollen_Wash"
                is_dangerous = True
                summary_msg = f"Heavy Rain ({rainfall_24h_mm} mm): Pollen wash-off risk during {growth_stage} stage."
                bio_explanation = (
                    f"Rainfall exceeding 75mm during anthesis (flowering) dilutes and washes away pollen grains from the open glumes, "
                    f"leading to spikelet sterility and unfilled chaffy grains."
                )
                mitigation_steps = [
                    MitigationStep(
                        step_number=1,
                        timing_window="Next 6 Hours",
                        action_title="Open Field Drains",
                        action_description="Lower plot bund outlets so water does not rise above 5 cm over the field floor."
                    ),
                    MitigationStep(
                        step_number=2,
                        timing_window="During Rain",
                        action_title="Suspend Fertilizer Application",
                        action_description="Stop top-dressing of Urea/DAP; nutrients will leach out into waterways."
                    ),
                    MitigationStep(
                        step_number=3,
                        timing_window="Post-Rain",
                        action_title="Apply Micro-nutrient Spray",
                        action_description="Foliar spray of 1% Potassium Nitrate (13:0:45) after sunshine to boost panicle grain filling."
                    )
                ]
            elif rainfall_24h_mm >= 15.0:
                threat_level = "BENEFICIAL"
                threat_type = "Natural_Water_Replenishment"
                is_dangerous = False
                summary_msg = f"Moderate Rainfall ({rainfall_24h_mm} mm) is Highly Beneficial for {crop_name}."
                bio_explanation = (
                    f"{crop_name} thrives under semi-aquatic wetland conditions. A rainfall of {rainfall_24h_mm}mm meets the high "
                    f"crop evapotranspiration demand (6-8 mm/day) and naturally enriches the standing water table without thermal shock."
                )
                mitigation_steps = [
                    MitigationStep(
                        step_number=1,
                        timing_window="Immediate",
                        action_title="Switch Off Tube Wells / Pumps",
                        action_description="Conserve groundwater and electricity by closing canal gates and switching off solar/borewell pumps."
                    ),
                    MitigationStep(
                        step_number=2,
                        timing_window="Next 12 Hours",
                        action_title="Strengthen Perimeter Bunds",
                        action_description="Ensure farm bunds are well-packed with clay so rainwater is impounded for the coming dry spell."
                    ),
                    MitigationStep(
                        step_number=3,
                        timing_window="Within 3 Days",
                        action_title="Monitor for Stem Borer",
                        action_description="Warm humid post-rain weather favors yellow stem borer; install 4 pheromone traps per acre."
                    )
                ]

        # =========================================================================
        # 2. ARID & PULSE CROPS (Groundnut, Chickpea, Black Gram, Green Gram)
        # Moderate rain is DANGEROUS! Soil saturation > 18 hours causes root hypoxia and fungal rot.
        # =========================================================================
        elif category == "arid_pulse":
            if rainfall_24h_mm >= 20.0:
                threat_level = "CRITICAL" if rainfall_24h_mm >= 40.0 else "WARNING"
                threat_type = "Root_Rot_and_Anoxia_Hypoxia"
                is_dangerous = True
                summary_msg = f"Rain Alert ({rainfall_24h_mm} mm): Severe Root Rot & Suffocation Risk for {crop_name}."
                bio_explanation = (
                    f"{crop_name} is an arid legume adapted to well-aerated soil. Rainfall of {rainfall_24h_mm}mm saturates the pore spaces "
                    f"in the topsoil, depriving root nodules of oxygen (hypoxia). This kills beneficial Rhizobium bacteria within 24 hours "
                    f"and triggers virulent damping-off and root rot from soil-borne Pythium and Rhizoctonia fungi."
                )
                mitigation_steps = [
                    MitigationStep(
                        step_number=1,
                        timing_window="Next 4 Hours (Urgent)",
                        action_title="Excavate Peripheral Drainage Trenches",
                        action_description="Dig 25-30 cm deep trenches along field margins to evacuate surface runoff immediately. Prevent any standing water."
                    ),
                    MitigationStep(
                        step_number=2,
                        timing_window="During Event",
                        action_title="Halt All Chemical Spraying",
                        action_description="Avoid walking on saturated field beds to prevent soil compaction and root shearing."
                    ),
                    MitigationStep(
                        step_number=3,
                        timing_window="Post-Rain within 24 Hours",
                        action_title="Soil Drenching with Bio-Fungicide",
                        action_description="Drench collar region with Trichoderma viride (10g/L water) or Copper Oxychloride (2.5g/L) to halt collar rot."
                    )
                ]
            else:
                threat_level = "ADVISORY"
                threat_type = "Moisture_Monitoring"
                summary_msg = f"Light rain ({rainfall_24h_mm} mm) observed for {crop_name}."
                bio_explanation = f"Light rain is tolerable, but ensure field has zero depression where water can pool."
                mitigation_steps = [
                    MitigationStep(
                        step_number=1,
                        timing_window="Next 12 Hours",
                        action_title="Clear Field Depressions",
                        action_description="Fill any small sinkholes or puddles with dry sand or loose topsoil."
                    ),
                    MitigationStep(
                        step_number=2,
                        timing_window="Next 24 Hours",
                        action_title="Check Root Zone Aeration",
                        action_description="Inspect if soil crust is forming; lightly loosen inter-row soil once dry."
                    ),
                    MitigationStep(
                        step_number=3,
                        timing_window="Next 3 Days",
                        action_title="Inspect for Leaf Spot (Tikka)",
                        action_description="High humidity favors Cercospora leaf spot; spray Neem Oil 10000 PPM prophylactically."
                    )
                ]

        # =========================================================================
        # 3. TALL STALK CROPS (Banana, Sugarcane, Maize)
        # Susceptible to lodging and pseudostem snapping under high wind gusts.
        # =========================================================================
        elif category == "tall_stalk":
            if wind_speed_kmh >= 35.0:
                threat_level = "CRITICAL"
                threat_type = "Severe_Lodging_and_Stem_Buckling"
                is_dangerous = True
                summary_msg = f"Cyclone/Wind Alert ({wind_speed_kmh} km/h): Critical Lodging Hazard for {crop_name}."
                bio_explanation = (
                    f"Due to heavy canopy biomass and shallow adventitious roots, wind gusts over 35 km/h cause stem toppling and "
                    f"pseudostem breakage, severing the vascular bundle and resulting in 70-100% yield loss."
                )
                mitigation_steps = [
                    MitigationStep(
                        step_number=1,
                        timing_window="Next 6 Hours",
                        action_title="Propping with Bamboo or Coir Rope",
                        action_description="Support heavy banana bunches or sugarcane stalks with double bamboo stakes. Tie 4-6 adjacent plants together into a tent structure."
                    ),
                    MitigationStep(
                        step_number=2,
                        timing_window="Next 12 Hours",
                        action_title="Earthing Up the Base",
                        action_description="Mound soil 20 cm high around the root collars to strengthen the mechanical base."
                    ),
                    MitigationStep(
                        step_number=3,
                        timing_window="During Storm",
                        action_title="Trim Older Heavy Leaves",
                        action_description="Remove dry lower leaves to reduce wind resistance on the upper canopy."
                    )
                ]

        # =========================================================================
        # 4. HORTICULTURE & CASH CROPS (Tomato, Chilli, Cotton)
        # =========================================================================
        else:
            if rainfall_24h_mm >= 30.0:
                threat_level = "WARNING"
                threat_type = "Blossom_Drop_and_Fungal_Damping_Off"
                is_dangerous = True
                summary_msg = f"Heavy Rain ({rainfall_24h_mm} mm): Flower shedding & fruit rot risk for {crop_name}."
                bio_explanation = (
                    f"Excessive moisture during {growth_stage} causes sudden drop in transpiration pull, leading to blossom drop and fruit rot. "
                    f"Splashing mud spreads Phytophthora and Colletotrichum spores onto lower foliage."
                )
                mitigation_steps = [
                    MitigationStep(
                        step_number=1,
                        timing_window="Immediate",
                        action_title="Maintain Free Drainage",
                        action_description="Clear furrow drains between ridges so excess rain runs off in under 3 hours."
                    ),
                    MitigationStep(
                        step_number=2,
                        timing_window="Next 12 Hours",
                        action_title="Reinforce Staking & Trellises",
                        action_description="Tighten support wires and bamboo stakes holding tomato and chilli vines."
                    ),
                    MitigationStep(
                        step_number=3,
                        timing_window="Post-Rain",
                        action_title="Prophylactic Organic Spray",
                        action_description="Spray Bordeaux mixture 1% or certified Neem Oil to arrest fruit cracking and Anthracnose."
                    )
                ]

        # Audio transcript script for the Voice Assistant in simple, conversational cadence
        audio_script = (
            f"Attention farmer. Alert for your {crop_name} crop. Status is {threat_level}. "
            f"Expected rain is {rainfall_24h_mm} millimeters, wind speed is {wind_speed_kmh} kilometers per hour. "
            f"{summary_msg} Action required: {mitigation_steps[0].action_title if mitigation_steps else 'Maintain routine monitoring.'}"
        )

        return CropThreatAssessment(
            crop_id=crop_id,
            crop_name=crop_name,
            crop_category=category,
            growth_stage=growth_stage,
            threat_level=threat_level,
            threat_type=threat_type,
            is_dangerous=is_dangerous,
            summary_message=summary_msg,
            biological_explanation=bio_explanation,
            mitigation_steps=mitigation_steps,
            audio_text_script=audio_script
        )
