from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, func
from app.core.database import Base

class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    soil_ph = Column(Float, nullable=True)
    soil_texture = Column(String(100), nullable=True)
    rainfall_profile = Column(String(100), nullable=True)
    groundwater_status = Column(String(100), nullable=True)
    recommendations_json = Column(Text, nullable=False) # JSON array of top 3 crops with projected yields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
