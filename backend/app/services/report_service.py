from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO
from datetime import date, timedelta
from typing import Any
from sqlalchemy.orm import Session
from app.models.health import HealthProfile, CycleLog, SymptomLog
from app.services.cycle_service import CycleService
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import os

class ReportService:
    @staticmethod
    def _generate_symptom_chart(symptom_logs: list) -> BytesIO:
        # Simple chart: Symptom counts over last 30 logs
        dates = [log.log_date for log in symptom_logs[:30]][::-1]
        flow_levels = [log.flow_level for log in symptom_logs[:30]][::-1]
        
        if not dates:
            return None

        plt.figure(figsize=(6, 3))
        plt.plot(dates, flow_levels, marker='o', color='#E91E63', linewidth=2)
        plt.fill_between(dates, flow_levels, color='#FCE4EC', alpha=0.5)
        plt.title('Recent Cycle Intensity (Flow Level)', fontsize=10)
        plt.xticks(rotation=45, fontsize=8)
        plt.yticks(range(5), ['None', 'Spotting', 'Light', 'Medium', 'Heavy'], fontsize=8)
        plt.tight_layout()
        
        chart_buffer = BytesIO()
        plt.savefig(chart_buffer, format='png', dpi=150)
        plt.close()
        chart_buffer.seek(0)
        return chart_buffer

    @staticmethod
    def generate_doctor_report(db: Session, user_uuid: Any) -> BytesIO:
        # 1. Fetch Data
        profile = db.query(HealthProfile).filter(HealthProfile.user_uuid == user_uuid).first()
        six_months_ago = date.today() - timedelta(days=180)
        cycle_logs = db.query(CycleLog).filter(
            CycleLog.user_uuid == user_uuid,
            CycleLog.start_date >= six_months_ago
        ).order_by(CycleLog.start_date.desc()).all()
        
        symptom_logs = db.query(SymptomLog).filter(
            SymptomLog.user_uuid == user_uuid,
            SymptomLog.log_date >= six_months_ago
        ).order_by(SymptomLog.log_date.desc()).all()

        # 2. Setup PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=20,
            textColor=colors.HexColor("#E91E63")  # Primary color
        )
        elements.append(Paragraph("Health History Report", title_style))
        elements.append(Paragraph(f"Generated on: {date.today().strftime('%B %d, %Y')}", styles['Normal']))
        elements.append(Spacer(1, 20))

        # Patient Info
        elements.append(Paragraph("Patient Information", styles['Heading2']))
        patient_data = [
            ["Name:", profile.name if profile and profile.name else "N/A"],
            ["Age:", str(profile.age) if profile and profile.age else "N/A"],
            ["Average Cycle:", f"{profile.average_cycle_length} days" if profile else "N/A"],
            ["Average Period:", f"{profile.average_period_length} days" if profile else "N/A"],
        ]
        t = Table(patient_data, colWidths=[100, 300])
        t.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 20))

        # Cycle History
        elements.append(Paragraph("Recent Cycle History (Last 6 Months)", styles['Heading2']))
        if cycle_logs:
            cycle_data = [["Start Date", "End Date", "Duration", "Intensity"]]
            for log in cycle_logs:
                duration = (log.end_date - log.start_date).days + 1 if log.end_date else "Ongoing"
                cycle_data.append([
                    log.start_date.strftime("%Y-%m-%d"),
                    log.end_date.strftime("%Y-%m-%d") if log.end_date else "-",
                    f"{duration} days" if isinstance(duration, int) else duration,
                    log.intensity or "N/A"
                ])
            
            ct = Table(cycle_data, colWidths=[100, 100, 100, 100])
            ct.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FCE4EC")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            elements.append(ct)
        else:
            elements.append(Paragraph("No cycle data recorded in the last 6 months.", styles['Normal']))
        
        elements.append(Spacer(1, 20))

        # Charts Section
        elements.append(Paragraph("Health Visualization", styles['Heading2']))
        chart_buf = ReportService._generate_symptom_chart(symptom_logs)
        if chart_buf:
            img = Image(chart_buf, width=400, height=200)
            elements.append(img)
            elements.append(Spacer(1, 20))
        else:
            elements.append(Paragraph("Not enough data to generate charts.", styles['Normal']))

        # Symptom Summary
        elements.append(Paragraph("Symptom & Mood Summary", styles['Heading2']))
        if symptom_logs:
            # Aggregate top symptoms
            symptom_counts = {}
            for log in symptom_logs:
                for s, val in (log.pain_metrics or {}).items():
                    if val > 0: symptom_counts[s] = symptom_counts.get(s, 0) + 1
                for m in (log.mood_metrics or []):
                    symptom_counts[m] = symptom_counts.get(m, 0) + 1
            
            sorted_symptoms = sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            if sorted_symptoms:
                s_data = [["Symptom/Mood", "Frequency (Days)"]]
                for s, count in sorted_symptoms:
                    s_data.append([s.replace("_", " ").title(), str(count)])
                
                st = Table(s_data, colWidths=[200, 100])
                st.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F3E5F5")),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ]))
                elements.append(st)
            else:
                elements.append(Paragraph("No specific symptoms or moods logged.", styles['Normal']))
        else:
            elements.append(Paragraph("No symptom data recorded in the last 6 months.", styles['Normal']))

        elements.append(Spacer(1, 20))

        # Notes Section
        elements.append(Paragraph("Recent Notes", styles['Heading2']))
        notes_found = False
        for log in symptom_logs[:10]: # Last 10 logs with notes
            if log.notes:
                elements.append(Paragraph(f"<b>{log.log_date.strftime('%Y-%m-%d')}:</b> {log.notes}", styles['Normal']))
                elements.append(Spacer(1, 5))
                notes_found = True
        
        if not notes_found:
            elements.append(Paragraph("No recent notes found.", styles['Normal']))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
