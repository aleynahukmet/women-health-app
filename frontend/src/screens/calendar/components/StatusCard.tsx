import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Info, AlertCircle, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { differenceInDays, parseISO, format } from 'date-fns';
import { CycleRing } from './CycleRing';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

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
  const cycleDay = differenceInDays(new Date(), parseISO(predictions.current_cycle.menstrual_phase.start)) + 1;
  
  // Calculate progress for the wave (e.g., progress through the cycle)
  const cycleLength = predictions.average_cycle_length || 28;
  const progress = Math.min(cycleDay / cycleLength, 1);

  return (
    <View style={styles.statusCard}>
      <View style={[styles.phaseIndicator, { backgroundColor: themeColor }]}>
        <Text style={styles.phaseText}>{t(`phases.${currentPhase.toLowerCase()}`)} Phase</Text>
      </View>
      
      <View style={styles.waveWrapper}>
        <CycleRing 
          size={220} 
          progress={progress} 
          themeColor={themeColor} 
          currentPhase={currentPhase}
          cycleDay={cycleDay}
        />
      </View>

      <View style={styles.predictionContainer}>
        <Text style={styles.predictionText}>
          {t('dashboard.period_in', { days: daysUntilPeriod })}
        </Text>
        
        {prediction_window && (
          <Text style={styles.windowText}>
            Expected: {format(parseISO(prediction_window.start), 'MMM d')} - {format(parseISO(prediction_window.end), 'MMM d')}
          </Text>
        )}
      </View>
      
      <View style={styles.badgeContainer}>
        {is_override && (
          <View style={styles.overrideBadge}>
            <Zap size={14} color={Colors.ovulation} />
            <Text style={styles.overrideText}>
              {override_reason === 'ovulation_signal' ? 'Adjusted by fertile signs' : 'Adjusted by symptoms'}
            </Text>
          </View>
        )}

        {is_irregular && !is_override && (
          <View style={styles.irregularBadge}>
            <AlertCircle size={14} color={Colors.textSecondary} />
            <Text style={styles.irregularText}>Cycle variation detected</Text>
          </View>
        )}

        {currentPhase === 'Ovulatory' && (
          <View style={styles.fertileBadge}>
            <Info size={14} color={Colors.primary} />
            <Text style={styles.fertileText}>High chance of conception</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: Spacing.xl,
  },
  phaseIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    marginBottom: 24,
  },
  phaseText: {
    color: Colors.card,
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  waveWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    marginBottom: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dayNumber: {
    fontSize: 56,
    fontWeight: '800',
  },
  dayLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: -4,
    fontWeight: '600',
  },
  predictionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  predictionText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  windowText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  fertileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  fertileText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  overrideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  overrideText: {
    color: Colors.ovulation,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  irregularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  irregularText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
