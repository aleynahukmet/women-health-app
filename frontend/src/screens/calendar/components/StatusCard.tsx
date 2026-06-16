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
  
  const cycleLength = predictions.average_cycle_length || 28;
  const progress = Math.min(cycleDay / cycleLength, 1);

  const isPeriod = currentPhase === 'Menstrual';

  return (
    <View style={styles.statusCard}>
      <View style={styles.headerInfo}>
        <Text style={[styles.phaseText, { color: themeColor }]}>
          {t(`phases.${currentPhase.toLowerCase()}`)} Phase
        </Text>
        <Text style={styles.dayText}>Day {cycleDay}</Text>
      </View>
      
      <View style={styles.waveWrapper}>
        <CycleRing 
          size={260} 
          progress={progress} 
          themeColor={themeColor} 
          currentPhase={currentPhase}
          cycleDay={cycleDay}
        />
      </View>

      <View style={styles.predictionContainer}>
        <Text style={styles.predictionText}>
          {isPeriod ? 'Period ends in' : 'Next period in'} {Math.abs(daysUntilPeriod)} days
        </Text>
        
        {isPeriod ? (
          <Text style={styles.windowText}>
            Estimated End: {format(parseISO(predictions.current_cycle.menstrual_phase.end), 'MMMM d')}
          </Text>
        ) : (
          prediction_window && (
            <Text style={styles.windowText}>
              Expected: {format(parseISO(prediction_window.start), 'MMM d')} - {format(parseISO(prediction_window.end), 'MMM d')}
            </Text>
          )
        )}
      </View>
      
      <View style={styles.badgeContainer}>
        {is_override && (
          <View style={styles.overrideBadge}>
            <Zap size={14} color={Colors.fertility} />
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
            <Info size={14} color={Colors.fertility} />
            <Text style={styles.fertileText}>High chance of conception</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: 'transparent',
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  phaseText: {
    fontWeight: '800',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  dayText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
  },
  waveWrapper: {
    width: 260,
    height: 260,
    borderRadius: 130,
    marginBottom: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  predictionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  predictionText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  windowText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  fertileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.fertility + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  fertileText: {
    color: Colors.fertility,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  overrideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.fertility + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  overrideText: {
    color: Colors.fertility,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  irregularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  irregularText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
});
