from datetime import date, timedelta
from typing import List, Dict, Optional, Any

class CycleEngine:
    @staticmethod
    def calculate_cycle_phases(
        last_period_date: date, 
        cycle_length: int = 28, 
        period_length: int = 5,
        recent_logs: List[Any] = None,
        variation: float = 0,
        historical_cycles: List[Any] = None,
        evaluation_date: date = date.today()
    ) -> Dict:
        """
        Calculates cycle phases with dynamic symptom overrides and prediction windows.
        Bases calculations on historical start and end dates if available.
        """
        # If we have historical cycles, we can refine the ovulation prediction
        # Typically ovulation happens cycle_length - 14 days, but some users have different luteal phases
        luteal_phase_length = 14
        
        if historical_cycles and len(historical_cycles) >= 3:
            # Simple heuristic: if we had symptoms or other data, we could refine this.
            # For now, we stick to 14 but allow future refinement.
            pass

        ovulation_day_index = cycle_length - luteal_phase_length
        ovulation_date = last_period_date + timedelta(days=ovulation_day_index - 1)
        next_period_date = last_period_date + timedelta(days=cycle_length)
        
        is_override = False
        override_reason = None

        # --- Physiological Tier: Symptom Overrides ---
        if recent_logs:
            # Sort logs by date descending (most recent first)
            sorted_logs = sorted(recent_logs, key=lambda x: x.log_date, reverse=True)
            
            for log in sorted_logs:
                # 1. Ovulation Signals (Cervical Mucus / LH Tests)
                if (evaluation_date - log.log_date).days <= 5: # Extended window for fertile signs
                    lifestyle = log.lifestyle_metrics or {}
                    if lifestyle.get("cervical_mucus") == "egg_white" or lifestyle.get("ovulation_test") == "positive":
                        ovulation_date = log.log_date
                        next_period_date = ovulation_date + timedelta(days=luteal_phase_length)
                        is_override = True
                        override_reason = "ovulation_signal"
                        break
                
                # 2. Luteal Pain Wave (Pattern Matching)
                days_into_cycle = (evaluation_date - last_period_date).days
                if days_into_cycle > (cycle_length - 7): # Last week of cycle
                    pain = log.pain_metrics or {}
                    if pain.get("tender_breasts", 0) >= 2 or pain.get("cramps", 0) >= 2:
                        # Predict period sooner if symptoms are strong
                        next_period_date = evaluation_date + timedelta(days=2)
                        is_override = True
                        override_reason = "luteal_pattern"
                        break

        # --- UX Tier: Prediction Window ---
        # Window width depends on variation. Regular (0-3 days) vs Irregular (>3 days)
        window_days = max(2, int(variation))
        prediction_window = {
            "start": next_period_date - timedelta(days=window_days),
            "end": next_period_date + timedelta(days=window_days)
        }

        # Calculate phases based on (potentially overridden) dates
        menstrual_start = last_period_date
        menstrual_end = last_period_date + timedelta(days=period_length - 1)
        
        follicular_start = last_period_date + timedelta(days=period_length)
        follicular_end = ovulation_date - timedelta(days=1)
        
        fertile_window_start = ovulation_date - timedelta(days=5)
        fertile_window_end = ovulation_date + timedelta(days=1)
        
        luteal_start = ovulation_date + timedelta(days=2)
        luteal_end = next_period_date - timedelta(days=1)
        
        return {
            "current_cycle": {
                "menstrual_phase": {"start": menstrual_start, "end": menstrual_end},
                "follicular_phase": {"start": follicular_start, "end": follicular_end},
                "ovulatory_phase": {"start": ovulation_date, "end": ovulation_date + timedelta(days=1)},
                "fertile_window": {"start": fertile_window_start, "end": fertile_window_end},
                "luteal_phase": {"start": luteal_start, "end": luteal_end},
            },
            "average_cycle_length": cycle_length,
            "average_period_length": period_length,
            "next_period_date": next_period_date,
            "prediction_window": prediction_window,
            "ovulation_date": ovulation_date,
            "is_irregular": variation > 4,
            "is_override": is_override,
            "override_reason": override_reason
        }

    @staticmethod
    def get_current_phase(current_date: date, phases: Dict) -> str:
        """
        Determines which phase the user is currently in.
        """
        c = phases["current_cycle"]
        if c["menstrual_phase"]["start"] <= current_date <= c["menstrual_phase"]["end"]:
            return "Menstrual"
        if c["ovulatory_phase"]["start"] == current_date:
            return "Ovulatory"
        if c["follicular_phase"]["start"] <= current_date <= c["follicular_phase"]["end"]:
            return "Follicular"
        if c["luteal_phase"]["start"] <= current_date <= c["luteal_phase"]["end"]:
            return "Luteal"
        return "Unknown"
