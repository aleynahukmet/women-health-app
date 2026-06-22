import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar as CalendarIcon, Plus, TrendingUp, BookOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors as StaticColors, Spacing, BorderRadius, useTheme } from '../../../theme/theme';

interface QuickActionsProps {
  onLogSymptoms: () => void;
  onLogPeriod: () => void;
  onViewInsights?: () => void;
  currentPhase?: string;
  onStartPeriod?: () => void;
  onEndPeriod?: () => void;
  onAddNotes?: () => void;
  isActionLoading?: boolean;
  predictions?: any;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onLogSymptoms, 
  onLogPeriod,
  onViewInsights,
  currentPhase,
  onStartPeriod,
  onEndPeriod,
  onAddNotes,
  isActionLoading = false,
  predictions,
}) => {
  const { t } = useTranslation();
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => createStyles(Colors), [Colors]);
  const isPeriodActive = currentPhase === 'Menstrual';
  
  // Check if period is already logged (has both start and end date)
  const isPeriodLogged = predictions?.current_cycle?.menstrual_phase?.end && 
                        new Date(predictions.current_cycle.menstrual_phase.end) <= new Date();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Daily Tracking</Text>
      
      {/* 2x2 Elegant Action Grid */}
      <View style={styles.grid}>
        
        {/* Period Status Button - Minimalist & Smart */}
        <TouchableOpacity 
          style={[
            styles.gridCard, 
            isPeriodActive && { borderColor: Colors.period, backgroundColor: Colors.period + '08' },
            isPeriodLogged && { borderColor: Colors.success, backgroundColor: Colors.success + '08' }
          ]} 
          onPress={isPeriodActive ? onEndPeriod : onStartPeriod}
          disabled={isActionLoading || isPeriodLogged}
        >
          <View style={[
            styles.iconContainer, 
            { backgroundColor: isPeriodLogged ? Colors.success + '20' : (isPeriodActive ? Colors.period + '20' : Colors.border) }
          ]}>
            <CalendarIcon size={20} color={isPeriodLogged ? Colors.success : (isPeriodActive ? Colors.period : Colors.textSecondary)} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Period State</Text>
            {isActionLoading ? (
              <ActivityIndicator size="small" color={Colors.period} style={{ alignSelf: 'flex-start', marginTop: 2 }} />
            ) : (
              <Text style={[
                styles.cardActionText, 
                { color: isPeriodLogged ? Colors.success : (isPeriodActive ? Colors.period : Colors.text) }
              ]}>
                {isPeriodLogged ? 'Period Logged' : (isPeriodActive ? 'End Period' : 'Start Period')}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Symptoms Button */}
        <TouchableOpacity style={styles.gridCard} onPress={onLogSymptoms}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.fertility + '15' }]}>
            <Plus size={20} color={Colors.fertility} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Symptoms</Text>
            <Text style={[styles.cardActionText, { color: Colors.fertility }]}>Log Today</Text>
          </View>
        </TouchableOpacity>

        {/* Journal Button */}
        <TouchableOpacity style={styles.gridCard} onPress={onAddNotes}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.follicular + '20' }]}>
            <BookOpen size={20} color={Colors.follicular} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Journal</Text>
            <Text style={styles.cardActionText}>Add Notes</Text>
          </View>
        </TouchableOpacity>

        {/* Analytics Button */}
        <TouchableOpacity style={styles.gridCard} onPress={onViewInsights}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.textSecondary + '15' }]}>
            <TrendingUp size={20} color={Colors.textSecondary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Analytics</Text>
            <Text style={[styles.cardActionText, { color: Colors.textSecondary }]}>View Trends</Text>
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
});
