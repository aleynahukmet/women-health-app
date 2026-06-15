from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.health import SymptomLog, CycleLog, HealthProfile
from app.services.cycle_service import CycleService
from app.services.cycle_engine import CycleEngine

class InsightsService:
    @staticmethod
    def get_user_insights(db: Session, user_uuid: Any) -> Dict:
        """
        Generates personalized health insights by analyzing historical symptom patterns
        relative to cycle phases.
        """
        # 1. Fetch all historical data
        cycle_logs = db.query(CycleLog).filter(CycleLog.user_uuid == user_uuid).order_by(CycleLog.start_date.asc()).all()
        symptom_logs = db.query(SymptomLog).filter(SymptomLog.user_uuid == user_uuid).order_by(SymptomLog.log_date.asc()).all()
        profile = db.query(HealthProfile).filter(HealthProfile.user_uuid == user_uuid).first()

        if not cycle_logs or not profile:
            return {
                "phase_correlations": [],
                "symptom_fingerprints": [],
                "correlations": [],
                "daily_insight": "We need at least one full cycle of data to start generating personalized insights."
            }

        # 2. Map symptoms to cycle relative days and phases
        # We'll group symptoms by the phase they occurred in
        phase_stats = {
            "Menstrual": {"logs": 0, "symptoms": {}},
            "Follicular": {"logs": 0, "symptoms": {}},
            "Ovulatory": {"logs": 0, "symptoms": {}},
            "Luteal": {"logs": 0, "symptoms": {}}
        }

        metrics = CycleService.calculate_metrics(cycle_logs)
        cycle_length = metrics["median_cycle_length"]
        period_length = metrics["median_period_length"]

        for log in symptom_logs:
            # Find the cycle this log belongs to
            # For simplicity, find the most recent cycle start before this log
            closest_cycle_start = None
            for cycle in reversed(cycle_logs):
                if cycle.start_date <= log.log_date:
                    closest_cycle_start = cycle.start_date
                    break
            
            if not closest_cycle_start:
                continue

            # Determine phase for this log date
            phase = CycleService.get_phase_for_date(
                log.log_date, 
                closest_cycle_start, 
                cycle_length, 
                period_length
            )
            
            if phase in phase_stats:
                phase_stats[phase]["logs"] += 1
                
                # Aggregate symptoms
                # 1. Pain metrics
                for symptom, intensity in (log.pain_metrics or {}).items():
                    if intensity > 0:
                        phase_stats[phase]["symptoms"][symptom] = phase_stats[phase]["symptoms"].get(symptom, 0) + 1
                
                # 2. Mood metrics
                for mood in (log.mood_metrics or []):
                    phase_stats[phase]["symptoms"][mood] = phase_stats[phase]["symptoms"].get(mood, 0) + 1
                
                # 3. Flow level
                if log.flow_level > 0:
                    phase_stats[phase]["symptoms"]["period_flow"] = phase_stats[phase]["symptoms"].get("period_flow", 0) + 1

        # 3. Generate Phase Correlations
        correlations = []
        for phase, data in phase_stats.items():
            if data["logs"] > 0:
                top_symptoms = sorted(
                    [{"id": s, "count": c, "percentage": round((c / data["logs"]) * 100)} 
                     for s, c in data["symptoms"].items()],
                    key=lambda x: x["count"],
                    reverse=True
                )[:3]
                correlations.append({
                    "phase": phase,
                    "top_symptoms": top_symptoms
                })

        # 4. Symptom Fingerprints (e.g., Luteal Phase Fingerprint)
        fingerprints = []
        luteal_data = phase_stats.get("Luteal", {})
        if luteal_data.get("logs", 0) > 0:
            luteal_symptoms = sorted(
                [{"id": s, "label": s.replace("_", " ").title(), "percentage": round((c / luteal_data["logs"]) * 100)} 
                 for s, c in luteal_data["symptoms"].items()],
                key=lambda x: x["percentage"],
                reverse=True
            )[:4]
            fingerprints.append({
                "title": "Your Luteal Phase Fingerprint",
                "symptoms": luteal_symptoms
            })

        # 5. Daily Insight (Pattern Match)
        daily_insight = "Your data is looking consistent! Tracking daily helps us find your unique patterns."
        
        # Simple pattern: Irritability in Luteal phase
        luteal_irritability = luteal_data.get("symptoms", {}).get("irritable", 0)
        if luteal_data.get("logs", 0) > 0 and (luteal_irritability / luteal_data["logs"]) > 0.5:
            daily_insight = "Your mood often dips during the Luteal phase. This is a common response to progesterone changes. Consider extra self-care today."

        return {
            "phase_correlations": correlations,
            "symptom_fingerprints": fingerprints,
            "correlations": correlations, # Duplicate for flexibility
            "daily_insight": daily_insight
        }
