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

        # 6. Recent Notes
        recent_notes = []
        for log in reversed(symptom_logs):
            if log.notes:
                recent_notes.append({
                    "date": log.log_date.strftime("%B %d, %Y"),
                    "text": log.notes
                })
                if len(recent_notes) >= 5: # Top 5 recent notes
                    break

        # 7. Cycle Comparison
        current_cycle_length = None
        if len(cycle_logs) >= 2:
            current_cycle_length = (cycle_logs[-1].start_date - cycle_logs[-2].start_date).days

        # 8. Symptom Trends (Last 3 Months)
        symptom_trends = []
        today = date.today()
        
        # 9. Anomaly Detection
        warnings = []
        if len(cycle_logs) >= 2:
            last_cycle = cycle_logs[-1]
            prev_cycle = cycle_logs[-2]
            
            last_cycle_length = (last_cycle.start_date - prev_cycle.start_date).days
            
            # Medical Standard: Short Cycle (< 21 days)
            if last_cycle_length < 21:
                warnings.append({
                    "type": "short_cycle",
                    "severity": "medium",
                    "title": "Short Cycle Detected",
                    "message": f"Your last cycle was {last_cycle_length} days. Cycles shorter than 21 days can be caused by stress, diet, or hormonal changes."
                })
            
            # Medical Standard: Long Cycle (> 35 days)
            elif last_cycle_length > 35:
                warnings.append({
                    "type": "long_cycle",
                    "severity": "medium",
                    "title": "Long Cycle Detected",
                    "message": f"Your last cycle was {last_cycle_length} days. Cycles longer than 35 days are common but can sometimes indicate ovulation changes."
                })
            
            # Statistical Anomaly: Significant deviation from average (> 5 days)
            diff_from_avg = abs(last_cycle_length - int(cycle_length))
            if diff_from_avg >= 5 and not (last_cycle_length < 21 or last_cycle_length > 35):
                warnings.append({
                    "type": "cycle_deviation",
                    "severity": "low",
                    "title": "Cycle Variation",
                    "message": f"Your cycle was {diff_from_avg} days { 'longer' if last_cycle_length > cycle_length else 'shorter' } than usual. Travel, stress, or illness can often cause this."
                })

        # Check for prolonged bleeding in the last log
        if cycle_logs:
            last_log = cycle_logs[-1]
            if last_log.end_date:
                period_days = (last_log.end_date - last_log.start_date).days + 1
                if period_days > 7:
                    warnings.append({
                        "type": "prolonged_bleeding",
                        "severity": "medium",
                        "title": "Prolonged Period",
                        "message": f"Your period lasted {period_days} days. If this continues for multiple cycles, consider consulting a specialist."
                    })

        # Helper to get month name and year
        def get_month_label(d: date):
            return d.strftime("%B")

        months = []
        for i in range(2, -1, -1):
            # Approximate start of month
            first_day = (today.replace(day=1) - timedelta(days=i*30)).replace(day=1)
            months.append(first_day)

        # Calculate Cramps Intensity
        cramps_data = []
        for m_start in months:
            m_end = (m_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            month_logs = [log for log in symptom_logs if m_start <= log.log_date <= m_end]
            
            avg_intensity = 0
            if month_logs:
                intensities = [log.pain_metrics.get("cramps", 0) for log in month_logs if "cramps" in (log.pain_metrics or {})]
                if intensities:
                    avg_intensity = sum(intensities) / len(intensities)
            
            cramps_data.append({"label": get_month_label(m_start), "value": round(avg_intensity, 1)})

        symptom_trends.append({
            "title": "Cramps Intensity",
            "data": cramps_data
        })

        # Calculate Mood Stability (Percentage of 'balanced' days)
        mood_data = []
        for m_start in months:
            m_end = (m_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            month_logs = [log for log in symptom_logs if m_start <= log.log_date <= m_end]
            
            stability_score = 0
            if month_logs:
                mood_logs = [log for log in month_logs if log.mood_metrics]
                if mood_logs:
                    balanced_count = sum(1 for log in mood_logs if "balanced" in log.mood_metrics)
                    stability_score = (balanced_count / len(mood_logs)) * 10
            
            mood_data.append({"label": get_month_label(m_start), "value": round(stability_score, 1)})

        symptom_trends.append({
            "title": "Mood Stability",
            "data": mood_data
        })

        return {
            "phase_correlations": correlations,
            "symptom_fingerprints": fingerprints,
            "correlations": correlations, # Duplicate for flexibility
            "daily_insight": daily_insight,
            "recent_notes": recent_notes,
            "average_cycle_length": int(cycle_length),
            "current_cycle_length": current_cycle_length,
            "symptom_trends": symptom_trends,
            "warnings": warnings
        }
