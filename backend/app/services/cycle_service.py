from datetime import date, timedelta
from typing import List, Dict, Optional
import statistics
from app.models.health import CycleLog

class CycleService:
    @staticmethod
    def calculate_metrics(logs: List[CycleLog]) -> Dict:
        """
        Calculates cycle metrics with outlier detection and exponential weighting.
        """
        if len(logs) < 2:
            return {
                "median_cycle_length": 28,
                "median_period_length": 5,
                "cycle_variation": 0,
                "is_baseline": True
            }
        
        # Sort logs by start date
        sorted_logs = sorted(logs, key=lambda x: x.start_date)
        
        # 1. Calculate raw cycle lengths
        raw_cycle_lengths = []
        for i in range(1, len(sorted_logs)):
            diff = (sorted_logs[i].start_date - sorted_logs[i-1].start_date).days
            raw_cycle_lengths.append(diff)
            
        # 2. Outlier Detection (Modified Z-score or simple range)
        # We'll filter out cycles < 15 or > 60 days as extreme anomalies
        filtered_cycle_lengths = [c for c in raw_cycle_lengths if 15 <= c <= 60]
        
        if not filtered_cycle_lengths:
            return {
                "median_cycle_length": 28,
                "median_period_length": 5,
                "cycle_variation": 0,
                "is_baseline": True
            }

        # 3. Exponential Moving Average (EMA)
        # Formula: EMA_today = (Value_today * alpha) + (EMA_yesterday * (1 - alpha))
        alpha = 0.4  # Smoothing factor: 0.4 weighs recent cycles significantly
        ema_cycle_length = filtered_cycle_lengths[0]
        for i in range(1, len(filtered_cycle_lengths)):
            ema_cycle_length = (filtered_cycle_lengths[i] * alpha) + (ema_cycle_length * (1 - alpha))
            
        # 4. Calculate Variation (Standard Deviation) for the UX Tier
        variation = statistics.stdev(filtered_cycle_lengths) if len(filtered_cycle_lengths) > 1 else 0
        
        # 5. Period Length Metrics
        period_lengths = []
        for log in sorted_logs:
            if log.end_date:
                length = (log.end_date - log.start_date).days + 1
                if 2 <= length <= 10:
                    period_lengths.append(length)
        
        median_period = int(statistics.median(period_lengths)) if period_lengths else 5
        
        return {
            "median_cycle_length": int(ema_cycle_length),
            "median_period_length": median_period,
            "cycle_variation": round(variation, 1),
            "is_baseline": len(filtered_cycle_lengths) < 3
        }

    @staticmethod
    def predict_next_cycles(last_start_date: date, cycle_length: int, count: int = 3) -> List[Dict]:
        """
        Predicts the next X cycles.
        """
        predictions = []
        current_start = last_start_date
        
        for _ in range(count):
            next_start = current_start + timedelta(days=cycle_length)
            predictions.append({
                "start_date": next_start,
                "end_date": next_start + timedelta(days=4), # Default 5 days
                "ovulation_date": next_start - timedelta(days=14)
            })
            current_start = next_start
            
        return predictions

    @staticmethod
    def get_phase_for_date(target_date: date, last_start_date: date, cycle_length: int, period_length: int) -> str:
        """
        Determines the phase for a specific date.
        """
        days_since_start = (target_date - last_start_date).days % cycle_length
        
        if 0 <= days_since_start < period_length:
            return "Menstrual"
        
        ovulation_day = cycle_length - 14
        if days_since_start == ovulation_day:
            return "Ovulatory"
        elif days_since_start < ovulation_day:
            return "Follicular"
        else:
            return "Luteal"
