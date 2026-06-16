from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime, timedelta

from app.db.session import get_db
from app.models import health as models
from app.schemas import health as schemas
from app.services.cycle_engine import CycleEngine
from app.services.cycle_service import CycleService
from app.services.insights_service import InsightsService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/profile", response_model=schemas.HealthProfile)
def create_or_update_profile(
    profile_in: schemas.HealthProfileCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_uuid == current_user.uuid
    ).first()
    
    if db_profile:
        user_data = profile_in.dict(exclude_unset=True)
        for var, value in user_data.items():
            setattr(db_profile, var, value)
    else:
        db_profile = models.HealthProfile(
            **profile_in.dict(), 
            user_uuid=current_user.uuid
        )
        db.add(db_profile)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/profile", response_model=schemas.HealthProfile)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_uuid == current_user.uuid
    ).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return db_profile

@router.get("/predictions", response_model=schemas.PredictionResponse)
def get_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_uuid == current_user.uuid
    ).first()
    
    if not db_profile or not db_profile.last_period_date:
        raise HTTPException(status_code=400, detail="Profile or last period date missing")
    
    # 1. Get historical cycle logs for baseline metrics
    cycle_logs = db.query(models.CycleLog).filter(
        models.CycleLog.user_uuid == current_user.uuid
    ).all()
    
    metrics = CycleService.calculate_metrics(cycle_logs)
    cycle_length = metrics["median_cycle_length"]
    period_length = metrics["median_period_length"]
    variation = metrics["cycle_variation"]
    
    # 2. Get recent symptom logs (last 30 days) for physiological overrides
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_symptoms = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_uuid == current_user.uuid,
        models.SymptomLog.log_date >= thirty_days_ago
    ).all()
    
    # 3. Calculate phases with dynamic engine
    predictions = CycleEngine.calculate_cycle_phases(
        last_period_date=db_profile.last_period_date,
        cycle_length=cycle_length,
        period_length=period_length,
        recent_logs=recent_symptoms,
        variation=variation,
        historical_cycles=cycle_logs
    )
    
    # 4. Predict future cycles
    next_cycles = CycleService.predict_next_cycles(
        predictions["next_period_date"], 
        cycle_length
    )
    
    # 5. Determine current phase
    current_phase = CycleEngine.get_current_phase(
        date.today(), 
        predictions
    )
    
    return {
        **predictions, 
        "current_phase": current_phase,
        "next_cycles": next_cycles
    }

@router.get("/insights", response_model=schemas.InsightsResponse)
def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return InsightsService.get_user_insights(db, current_user.uuid)

@router.post("/symptoms", response_model=schemas.SymptomLog)
def log_symptom(
    symptom_in: schemas.SymptomLogCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_symptom = models.SymptomLog(
        **symptom_in.dict(),
        user_uuid=current_user.uuid
    )
    db.add(db_symptom)
    db.commit()
    db.refresh(db_symptom)
    return db_symptom

@router.get("/symptoms", response_model=List[schemas.SymptomLog])
def get_symptoms(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user),
    limit: int = 100
):
    return db.query(models.SymptomLog).filter(
        models.SymptomLog.user_uuid == current_user.uuid
    ).order_by(models.SymptomLog.log_date.desc()).limit(limit).all()

@router.post("/log", response_model=schemas.SymptomLog)
def upsert_log(
    log_in: schemas.SymptomLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upserts (Updates or Inserts) the symptom tracking data for a specific date.
    """
    db_log = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_uuid == current_user.uuid,
        models.SymptomLog.log_date == log_in.log_date
    ).first()
    
    if db_log:
        for var, value in log_in.dict(exclude_unset=True).items():
            setattr(db_log, var, value)
    else:
        db_log = models.SymptomLog(
            **log_in.dict(),
            user_uuid=current_user.uuid
        )
        db.add(db_log)
        
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/history", response_model=List[schemas.SymptomLog])
def get_history(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches logs within a time range to populate the dashboard calendar view.
    """
    return db.query(models.SymptomLog).filter(
        models.SymptomLog.user_uuid == current_user.uuid,
        models.SymptomLog.log_date >= start_date,
        models.SymptomLog.log_date <= end_date
    ).order_by(models.SymptomLog.log_date.asc()).all()

@router.post("/cycle-logs", response_model=schemas.CycleLog)
def log_cycle(
    cycle_in: schemas.CycleLogCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if a log already exists for this start date
    db_cycle = db.query(models.CycleLog).filter(
        models.CycleLog.user_uuid == current_user.uuid,
        models.CycleLog.start_date == cycle_in.start_date
    ).first()
    
    if db_cycle:
        for var, value in cycle_in.dict(exclude_unset=True).items():
            setattr(db_cycle, var, value)
    else:
        db_cycle = models.CycleLog(
            **cycle_in.dict(),
            user_uuid=current_user.uuid
        )
        db.add(db_cycle)
        
    db.commit()
    db.refresh(db_cycle)
    return db_cycle

@router.get("/cycle-logs", response_model=List[schemas.CycleLog])
def get_cycle_logs(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(models.CycleLog).filter(
        models.CycleLog.user_uuid == current_user.uuid
    ).order_by(models.CycleLog.start_date.desc()).all()
