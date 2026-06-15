from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

# Health Profile Schemas
class HealthProfileBase(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    date_of_birth: Optional[date] = None
    last_period_date: Optional[date] = None
    average_cycle_length: int = 28
    average_period_length: int = 5
    goal: Optional[str] = None

class HealthProfileCreate(HealthProfileBase):
    pass

class HealthProfile(HealthProfileBase):
    user_uuid: UUID
    updated_at: datetime

    class Config:
        from_attributes = True

# Log Schemas
class SymptomLogBase(BaseModel):
    log_date: date
    flow_level: int = 0
    pain_metrics: Dict[str, int] = {}
    mood_metrics: List[str] = []
    lifestyle_metrics: Dict[str, Any] = {}
    sex_logged: Dict[str, Any] = {}

class SymptomLogCreate(SymptomLogBase):
    pass

class SymptomLog(SymptomLogBase):
    id: int
    user_uuid: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CycleLogBase(BaseModel):
    start_date: date
    end_date: Optional[date] = None
    intensity: Optional[str] = None

class CycleLogCreate(CycleLogBase):
    pass

class CycleLog(CycleLogBase):
    id: int
    user_uuid: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Prediction Schemas
class PhaseDates(BaseModel):
    start: date
    end: date

class CyclePhases(BaseModel):
    menstrual_phase: PhaseDates
    follicular_phase: PhaseDates
    ovulatory_phase: PhaseDates
    fertile_window: PhaseDates
    luteal_phase: PhaseDates

class PredictionResponse(BaseModel):
    current_cycle: CyclePhases
    next_period_date: date
    prediction_window: PhaseDates
    ovulation_date: date
    current_phase: str
    is_irregular: bool = False
    is_override: bool = False
    override_reason: Optional[str] = None
    next_cycles: List[Dict] = []

class SymptomFrequency(BaseModel):
    id: str
    label: Optional[str] = None
    count: int
    percentage: int

class PhaseCorrelation(BaseModel):
    phase: str
    top_symptoms: List[SymptomFrequency]

class SymptomFingerprint(BaseModel):
    title: str
    symptoms: List[Dict[str, Any]]

class InsightsResponse(BaseModel):
    phase_correlations: List[PhaseCorrelation]
    symptom_fingerprints: List[SymptomFingerprint]
    daily_insight: str
