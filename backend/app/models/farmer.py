from sqlalchemy import Column, Integer, BigInteger, String, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    clerk_user_id = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(50), nullable=True)
    preferred_language = Column(String(10), default="te")  # te, hi, ta, kn, mr, en
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")
