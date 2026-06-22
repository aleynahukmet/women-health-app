import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Info, AlertCircle, Zap, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';
import { CycleRing } from './CycleRing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatusCardProps {
  predictions: any;
  themeColor: string;
  currentPhase: string;
  daysUntilPeriod: number;
  onExpand: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  predictions, 
  themeColor, 
  currentPhase, 
  daysUntilPeriod,
  onExpand
}) => {
  const { t } = useTranslation();

  if (!predictions) return null;

  const { is_irregular, is_override, override_reason, prediction_window } = predictions;
  const cycleDay = differenceInDays(new Date(), parseISO(predictions.current_cycle.menstrual_phase.start)) + 1;
  
  const menstrualEnd = parseISO(predictions.current_cycle.menstrual_phase.end);
  const today = new Date();
  const periodDaysLeft = Math.max(0, differenceInDays(menstrualEnd, today) + 1);

  const cycleLength = predictions.average_cycle_length || 28;
  const progress = Math.min(cycleDay / cycleLength, 1);

  const isPeriod = currentPhase === 'Menstrual';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.phaseText, { color: themeColor }]}>
              {t(`phases.${currentPhase.toLowerCase()}`)} Phase
            </Text>
            <Text style={styles.phaseSubtitle}>Your body is in its natural rhythm</Text>
          </View>
          <View style={styles.predictionInfo}>
            <Text style={styles.predictionTitle}>
              {isPeriod ? 'Period ends in' : 'Next period in'}
            </Text>
            <Text style={[styles.predictionDays, { color: themeColor }]}>
              {isPeriod ? `${periodDaysLeft} days` : `${Math.abs(daysUntilPeriod)} days`}
            </Text>
          </View>
        </View>

        <View style={styles.ringContainer}>
          <CycleRing 
            size={SCREEN_WIDTH * 0.55}
            progress={progress}
            currentPhase={currentPhase}
            themeColor={themeColor}
            cycleDay={cycleDay}
          />
        </View>

        <View style={styles.footer}>
          {prediction_window && !isPeriod && (
            <Text style={styles.windowText}>
              Expected: {format(parseISO(prediction_window.start), 'MMM d')} - {format(parseISO(prediction_window.end), 'MMM d')}
            </Text>
          )}
          <View style={styles.expandButtonContainer}>
            <ChevronDown size={20} color={Colors.textLight} />
          </View>
        </View>
      </View>

      <View style={styles.badgeContainer}>
        {is_override && (
          <View style={styles.badge}>
            <Zap size={12} color={Colors.fertility} />
            <Text style={styles.badgeText}>Adjusted by fertile signs</Text>
          </View>
        )}
        {is_irregular && (
          <View style={styles.badge}>
            <AlertCircle size={12} color={Colors.textSecondary} />
            <Text style={styles.badgeText}>Cycle variation</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: Spacing.xl,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  phaseSubtitle: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '600',
  },
  predictionInfo: {
    alignItems: 'flex-end',
  },
  predictionTitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  predictionDays: {
    fontSize: 18,
    fontWeight: '800',
  },
  ringContainer: {
    marginVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  windowText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  expandButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});
