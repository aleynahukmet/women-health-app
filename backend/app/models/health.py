from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.db.session import Base

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_uuid = Column(UUID(as_uuid=True), unique=True, index=True, nullable=False)
    
    # Core Profile Data (Separated from Auth)
    name = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    
    # Core Cycle Data
    last_period_date = Column(Date, nullable=True)
    average_cycle_length = Column(Integer, default=28)
    average_period_length = Column(Integer, default=5)
    
    # Preferences
    goal = Column(String, nullable=True) # e.g., "track_cycle", "get_pregnant", "avoid_pregnancy"
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CycleLog(Base):
    __tablename__ = "cycle_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_uuid = Column(UUID(as_uuid=True), index=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    intensity = Column(String, nullable=True) # light, medium, heavy
    
    created_at = Column(DateTime, default=datetime.utcnow)

class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_uuid = Column(UUID(as_uuid=True), index=True, nullable=False)
    log_date = Column(Date, nullable=False, index=True)
    
    flow_level = Column(Integer, default=0) # 0=None, 1=Spotting, 2=Light, 3=Medium, 4=Heavy
    pain_metrics = Column(JSON, default={}) # e.g., {"cramps": 2, "headache": 1}
    mood_metrics = Column(JSON, default=[]) # Array of strings: ["anxious", "irritable"]
    lifestyle_metrics = Column(JSON, default={}) # e.g., {"bloating": true, "sleep_quality": 2}
    sex_logged = Column(JSON, default={}) # e.g., {"active": true, "protected": true}
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
