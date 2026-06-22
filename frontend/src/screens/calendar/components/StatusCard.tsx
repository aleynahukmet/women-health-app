import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { Info, AlertCircle, Zap, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { differenceInDays, parseISO, format, startOfDay } from 'date-fns';
import { useTheme, Spacing, BorderRadius } from '../../../theme/theme';
import { CycleRing } from './CycleRing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatusCardProps {
  predictions: any;
  themeColor: string;
  currentPhase: string;
  daysUntilPeriod: number;
  onExpand: () => void;
  hasLogs: boolean; // Kullanıcının gerçek verisi olup olmadığını kontrol etmek için eklendi
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  predictions, 
  themeColor, 
  currentPhase, 
  daysUntilPeriod,
  onExpand,
  hasLogs
}) => {
  const { t } = useTranslation();
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  if (!predictions) return null;

  const { is_irregular, is_override, override_reason, prediction_window } = predictions;
  
  const today = startOfDay(new Date());
  const menstrualStart = startOfDay(parseISO(predictions.current_cycle.menstrual_phase.start));
  const menstrualEnd = startOfDay(parseISO(predictions.current_cycle.menstrual_phase.end));
  
  // Eğer kullanıcının hiç geçmiş kaydı yoksa rastgele 1. gün yazmasın, temiz bir placeholder dönsün
  const cycleDay = hasLogs ? (differenceInDays(today, menstrualStart) + 1) : '--';
  const periodDaysLeft = Math.max(0, differenceInDays(menstrualEnd, today) + 1);

  const cycleLength = predictions.average_cycle_length || 28;
  const progress = hasLogs ? Math.min(Number(cycleDay) / cycleLength, 1) : 0;

  const isPeriod = currentPhase === 'Menstrual';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.phaseText, { color: themeColor }]}>
              {hasLogs ? `${t(`phases.${currentPhase.toLowerCase()}`)} Phase` : 'Welcome to Gaia'}
            </Text>
            <Text style={styles.phaseSubtitle}>
              {hasLogs ? 'Your body is in its natural rhythm' : 'Set up your cycle to start tracking'}
            </Text>
          </View>
          {hasLogs && (
            <View style={styles.predictionInfo}>
              <Text style={styles.predictionTitle}>
                {isPeriod ? 'Period ends in' : 'Next period in'}
              </Text>
              <Text style={[styles.predictionDays, { color: themeColor }]}>
                {isPeriod ? `${periodDaysLeft} days` : `${Math.abs(daysUntilPeriod)} days`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.ringContainer}>
          <CycleRing 
            size={SCREEN_WIDTH * 0.52}
            progress={progress}
            currentPhase={currentPhase}
            themeColor={themeColor}
            cycleDay={cycleDay} // Sayı ya da "--" string'ini güvenle basabilir
          />
        </View>

        {/* Yanıltıcı ok işareti kaldırıldı, yerine periyot girişini tetikleyen buton alanı eklendi */}
        <View style={styles.footer}>
          {prediction_window && !isPeriod && hasLogs ? (
            <Text style={styles.windowText}>
              Expected: {format(parseISO(prediction_window.start), 'MMM d')} - {format(parseISO(prediction_window.end), 'MMM d')}
            </Text>
          ) : (
            <Text style={styles.windowText}>Ready to log your cycle?</Text>
          )}
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: themeColor }]} onPress={onExpand}>
            <Calendar size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionButtonText}>
              {hasLogs ? 'Edit Period Log' : 'Log Period Start Date'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {hasLogs && (
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
      )}
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
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
    marginBottom: Spacing.md,
  },
  phaseText: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  phaseSubtitle: {
    fontSize: 12,
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
    marginVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  windowText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
