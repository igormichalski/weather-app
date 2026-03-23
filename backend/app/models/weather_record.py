from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id            = Column(Integer, primary_key=True, index=True)
    location_query = Column(String(255), nullable=False)
    city          = Column(String(255), nullable=False)
    country       = Column(String(10),  nullable=False)
    latitude      = Column(Float,       nullable=False)
    longitude     = Column(Float,       nullable=False)
    date_from     = Column(String(10),  nullable=False)
    date_to       = Column(String(10),  nullable=False)
    weather_data  = Column(Text,        nullable=False)
    notes         = Column(Text,        nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
