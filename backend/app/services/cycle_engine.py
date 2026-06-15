from datetime import date, timedelta
from typing import List, Dict, Optional, Any

class CycleEngine:
    @staticmethod
    def calculate_cycle_phases(
        last_period_date: date, 
        cycle_length: int = 28, 
        period_length: int = 5,
        recent_logs: List[Any] = None,
        variation: float = 0
    ) -> Dict:
        """
        Calculates cycle phases with dynamic symptom overrides and prediction windows.
        """
        # Default values
        ovulation_day_index = cycle_length - 14
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
                # If user logged high fertile signs in the last 3 days
                if (date.today() - log.log_date).days <= 3:
                    lifestyle = log.lifestyle_metrics or {}
                    # Check for "egg_white" mucus or positive test (mocked keys based on typical app logic)
                    if lifestyle.get("cervical_mucus") == "egg_white" or lifestyle.get("ovulation_test") == "positive":
                        ovulation_date = log.log_date
                        next_period_date = ovulation_date + timedelta(days=14)
                        is_override = True
                        override_reason = "ovulation_signal"
                        break
                
                # 2. Luteal Pain Wave (Pattern Matching)
                # If user logs "tender_breasts" and it's late in the cycle
                days_into_cycle = (date.today() - last_period_date).days
                if days_into_cycle > 20:
                    pain = log.pain_metrics or {}
                    if pain.get("tender_breasts", 0) >= 2: # Moderate or severe
                        # Predict period in 3 days if this is their typical pattern
                        next_period_date = date.today() + timedelta(days=3)
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
        
        follicular_start = last_period_date
        follicular_end = ovulation_date - timedelta(days=1)
        
        fertile_window_start = ovulation_date - timedelta(days=5)
        fertile_window_end = ovulation_date
        
        luteal_start = ovulation_date + timedelta(days=1)
        luteal_end = next_period_date - timedelta(days=1)
        
        return {
            "current_cycle": {
                "menstrual_phase": {"start": menstrual_start, "end": menstrual_end},
                "follicular_phase": {"start": follicular_start, "end": follicular_end},
                "ovulatory_phase": {"start": ovulation_date, "end": ovulation_date},
                "fertile_window": {"start": fertile_window_start, "end": fertile_window_end},
                "luteal_phase": {"start": luteal_start, "end": luteal_end},
            },
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
