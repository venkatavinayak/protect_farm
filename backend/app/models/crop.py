from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class PlantedCrop(Base):
    __tablename__ = "planted_crops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False) # e.g. Paddy, Groundnut, Cotton, Tomato
    crop_category = Column(String(50), nullable=False) # wetland, arid_pulse, cash_crop, horticulture, tall_stalk
    variety = Column(String(100), nullable=True) # e.g. BPT 5204, K-6, Bt-Cotton
    sowing_date = Column(Date, nullable=False)
    growth_stage = Column(String(50), nullable=False, default="Vegetative") # Seedling, Vegetative, Flowering, Maturity
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    farm = relationship("Farm", back_populates="crops")
    threat_logs = relationship("WeatherThreatLog", back_populates="crop", cascade="all, delete-orphan")
