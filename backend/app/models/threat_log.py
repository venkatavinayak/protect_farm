from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class WeatherThreatLog(Base):
    __tablename__ = "weather_threat_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    crop_id = Column(Integer, ForeignKey("planted_crops.id", ondelete="CASCADE"), nullable=True)
    threat_level = Column(String(50), nullable=False) # BENEFICIAL, SAFE, ADVISORY, WARNING, CRITICAL
    threat_type = Column(String(100), nullable=False) # e.g. Root_Rot_Hypoxia, Flower_Drop, Lodging, Cyclone
    weather_summary = Column(String(255), nullable=True)
    weather_data_json = Column(Text, nullable=True)
    xai_explanation = Column(Text, nullable=False)
    mitigation_steps_json = Column(Text, nullable=False) # Stored JSON list of 3 actionable steps
    regional_language = Column(String(10), default="te")
    translated_explanation = Column(Text, nullable=True)
    translated_steps_json = Column(Text, nullable=True)
    audio_data_base64 = Column(Text, nullable=True) # Cached audio or synthesis payload
    email_sent = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    farm = relationship("Farm", back_populates="threat_logs")
    crop = relationship("PlantedCrop", back_populates="threat_logs")
