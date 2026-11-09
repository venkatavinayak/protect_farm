from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False)
    farm_name = Column(String(255), nullable=False, default="My Main Farm")
    address = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=False)   # Centroid latitude
    longitude = Column(Float, nullable=False)  # Centroid longitude
    boundary_geojson = Column(Text, nullable=True) # GeoJSON Polygon coordinates string
    land_area_acres = Column(Float, nullable=False, default=1.0)
    soil_type = Column(String(100), default="Black Clayey Loam")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    farmer = relationship("Farmer", back_populates="farms")
    crops = relationship("PlantedCrop", back_populates="farm", cascade="all, delete-orphan")
    threat_logs = relationship("WeatherThreatLog", back_populates="farm", cascade="all, delete-orphan")
