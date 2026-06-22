from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta

from app.db.session import get_db
from app.models import health as models
from app.schemas import health as schemas
from app.services.cycle_engine import CycleEngine
from app.services.cycle_service import CycleService
from app.services.insights_service import InsightsService
from app.services.report_service import ReportService
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
    evaluation_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_uuid == current_user.uuid
    ).first()
    
    if not db_profile or not db_profile.last_period_date:
        raise HTTPException(status_code=400, detail="Profile or last period date missing")
    
    eval_date = evaluation_date or date.today()
    
    # 1. Get historical cycle logs for baseline metrics
    cycle_logs = db.query(models.CycleLog).filter(
        models.CycleLog.user_uuid == current_user.uuid
    ).all()
    
    metrics = CycleService.calculate_metrics(cycle_logs)
    cycle_length = metrics["median_cycle_length"]
    period_length = metrics["median_period_length"]
    variation = metrics["cycle_variation"]
    
    # 2. Get recent symptom logs (relative to evaluation date) for physiological overrides
    search_start = eval_date - timedelta(days=30)
    recent_symptoms = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_uuid == current_user.uuid,
        models.SymptomLog.log_date >= search_start,
        models.SymptomLog.log_date <= eval_date
    ).all()
    
    # 3. Calculate phases with dynamic engine
    predictions = CycleEngine.calculate_cycle_phases(
        last_period_date=db_profile.last_period_date,
        cycle_length=cycle_length,
        period_length=period_length,
        recent_logs=recent_symptoms,
        variation=variation,
        historical_cycles=cycle_logs,
        evaluation_date=eval_date
    )
    
    # 4. Predict future cycles
    next_cycles = CycleService.predict_next_cycles(
        predictions["next_period_date"], 
        cycle_length
    )
    
    # 5. Determine current phase
    current_phase = CycleEngine.get_current_phase(
        eval_date, 
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
    id: Optional[int] = None, # Added optional ID for smart updates
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. If frontend sent an ID, find that record and overwrite even if dates changed
    if id:
        db_cycle = db.query(models.CycleLog).filter(
            models.CycleLog.user_uuid == current_user.uuid,
            models.CycleLog.id == id
        ).first()
        if db_cycle:
            for var, value in cycle_in.dict(exclude_unset=True).items():
                setattr(db_cycle, var, value)
            db.commit()
            db.refresh(db_cycle)
            return db_cycle

    # 2. If no ID (New entry), continue with old logic
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

@router.delete("/data")
def delete_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permanently deletes all health-related data for the current user (GDPR Right to be Forgotten).
    """
    # 1. Delete Symptom Logs
    db.query(models.SymptomLog).filter(
        models.SymptomLog.user_uuid == current_user.uuid
    ).delete()
    
    # 2. Delete Cycle Logs
    db.query(models.CycleLog).filter(
        models.CycleLog.user_uuid == current_user.uuid
    ).delete()
    
    # 3. Delete Health Profile
    db.query(models.HealthProfile).filter(
        models.HealthProfile.user_uuid == current_user.uuid
    ).delete()
    
    db.commit()
    return {"message": "All user data has been permanently deleted"}

@router.get("/report")
def get_doctor_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a PDF report for the doctor.
    """
    from fastapi.responses import StreamingResponse
    
    pdf_buffer = ReportService.generate_doctor_report(db, current_user.uuid)
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=doctor_report_{date.today()}.pdf"}
    )

@router.get("/export")
def export_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exports all user health data as a JSON file.
    """
    profile = db.query(models.HealthProfile).filter(models.HealthProfile.user_uuid == current_user.uuid).first()
    cycle_logs = db.query(models.CycleLog).filter(models.CycleLog.user_uuid == current_user.uuid).all()
    symptom_logs = db.query(models.SymptomLog).filter(models.SymptomLog.user_uuid == current_user.uuid).all()
    
    data = {
        "export_date": datetime.utcnow().isoformat(),
        "profile": {
            "name": profile.name,
            "age": profile.age,
            "date_of_birth": profile.date_of_birth.isoformat() if profile.date_of_birth else None,
            "average_cycle_length": profile.average_cycle_length,
            "average_period_length": profile.average_period_length,
            "goal": profile.goal,
            "notification_prefs": profile.notification_prefs
        } if profile else None,
        "cycle_logs": [
            {
                "start_date": log.start_date.isoformat(),
                "end_date": log.end_date.isoformat() if log.end_date else None,
                "intensity": log.intensity
            } for log in cycle_logs
        ],
        "symptom_logs": [
            {
                "log_date": log.log_date.isoformat(),
                "flow_level": log.flow_level,
                "pain_metrics": log.pain_metrics,
                "mood_metrics": log.mood_metrics,
                "lifestyle_metrics": log.lifestyle_metrics,
                "sex_logged": log.sex_logged,
                "notes": log.notes
            } for log in symptom_logs
        ]
    }
    
    return data

@router.post("/import")
def import_user_data(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Imports user health data from a JSON object.
    Clears existing data before importing to prevent duplicates.
    """
    # 1. Clear existing data
    db.query(models.SymptomLog).filter(models.SymptomLog.user_uuid == current_user.uuid).delete()
    db.query(models.CycleLog).filter(models.CycleLog.user_uuid == current_user.uuid).delete()
    db.query(models.HealthProfile).filter(models.HealthProfile.user_uuid == current_user.uuid).delete()
    
    # 2. Import Profile
    profile_data = data.get("profile")
    if profile_data:
        db_profile = models.HealthProfile(
            user_uuid=current_user.uuid,
            name=profile_data.get("name"),
            age=profile_data.get("age"),
            date_of_birth=date.fromisoformat(profile_data["date_of_birth"]) if profile_data.get("date_of_birth") else None,
            average_cycle_length=profile_data.get("average_cycle_length", 28),
            average_period_length=profile_data.get("average_period_length", 5),
            goal=profile_data.get("goal"),
            notification_prefs=profile_data.get("notification_prefs", {})
        )
        db.add(db_profile)
    
    # 3. Import Cycle Logs
    for log_data in data.get("cycle_logs", []):
        db_log = models.CycleLog(
            user_uuid=current_user.uuid,
            start_date=date.fromisoformat(log_data["start_date"]),
            end_date=date.fromisoformat(log_data["end_date"]) if log_data.get("end_date") else None,
            intensity=log_data.get("intensity")
        )
        db.add(db_log)
        
    # 4. Import Symptom Logs
    for log_data in data.get("symptom_logs", []):
        db_log = models.SymptomLog(
            user_uuid=current_user.uuid,
            log_date=date.fromisoformat(log_data["log_date"]),
            flow_level=log_data.get("flow_level", 0),
            pain_metrics=log_data.get("pain_metrics", {}),
            mood_metrics=log_data.get("mood_metrics", []),
            lifestyle_metrics=log_data.get("lifestyle_metrics", {}),
            sex_logged=log_data.get("sex_logged", {}),
            notes=log_data.get("notes")
        )
        db.add(db_log)
        
    db.commit()
    return {"message": "Data imported successfully"}
