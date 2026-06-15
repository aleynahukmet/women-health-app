import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Info, AlertCircle, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { differenceInDays, parseISO, format } from 'date-fns';

interface StatusCardProps {
  predictions: any;
  themeColor: string;
  currentPhase: string;
  daysUntilPeriod: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  predictions, 
  themeColor, 
  currentPhase, 
  daysUntilPeriod 
}) => {
  const { t } = useTranslation();

  if (!predictions) return null;

  const { is_irregular, is_override, override_reason, prediction_window } = predictions;

  return (
    <View style={[styles.statusCard, { borderTopWidth: 8, borderTopColor: themeColor }]}>
      <View style={[styles.phaseIndicator, { backgroundColor: themeColor }]}>
        <Text style={styles.phaseText}>{t(`phases.${currentPhase.toLowerCase()}`)} Phase</Text>
      </View>
      
      <View style={[styles.cycleCircle, { borderColor: themeColor + '20' }]}>
        <Text style={[styles.dayNumber, { color: themeColor }]}>
          {differenceInDays(new Date(), parseISO(predictions.current_cycle.menstrual_phase.start)) + 1}
        </Text>
        <Text style={styles.dayLabel}>{t('dashboard.cycle_day')}</Text>
      </View>

      <View style={styles.predictionContainer}>
        <Text style={styles.predictionText}>
          {t('dashboard.period_in', { days: daysUntilPeriod })}
        </Text>
        
        {/* UX Tier: Prediction Window */}
        {prediction_window && (
          <Text style={styles.windowText}>
            Expected: {format(parseISO(prediction_window.start), 'MMM d')} - {format(parseISO(prediction_window.end), 'MMM d')}
          </Text>
        )}
      </View>
      
      {/* Physiological Tier: Override Badge */}
      {is_override && (
        <View style={styles.overrideBadge}>
          <Zap size={14} color="#FF9F43" />
          <Text style={styles.overrideText}>
            {override_reason === 'ovulation_signal' ? 'Adjusted by fertile signs' : 'Adjusted by symptoms'}
          </Text>
        </View>
      )}

      {/* Irregularity Warning */}
      {is_irregular && !is_override && (
        <View style={styles.irregularBadge}>
          <AlertCircle size={14} color="#636E72" />
          <Text style={styles.irregularText}>Cycle variation detected</Text>
        </View>
      )}

      {currentPhase === 'Ovulatory' && (
        <View style={styles.fertileBadge}>
          <Info size={14} color="#6C5CE7" />
          <Text style={styles.fertileText}>High chance of conception</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 32,
  },
  phaseIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  phaseText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cycleCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: '#F1F2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2D3436',
  },
  dayLabel: {
    fontSize: 14,
    color: '#636E72',
    marginTop: -4,
  },
  predictionContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  predictionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  windowText: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
  },
  fertileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEEFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  fertileText: {
    color: '#6C5CE7',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  overrideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  overrideText: {
    color: '#FF9F43',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  irregularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  irregularText: {
    color: '#636E72',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
