import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar as CalendarIcon, Plus, TrendingUp, BookOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

interface QuickActionsProps {
  onLogSymptoms: () => void;
  onLogPeriod: () => void;
  onViewCalendar?: () => void;
  onViewInsights?: () => void;
  currentPhase?: string;
  onStartPeriod?: () => void;
  onEndPeriod?: () => void;
  onAddNotes?: () => void;
  isActionLoading?: boolean;
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
}) => {
  const { t } = useTranslation();
  const isPeriod = currentPhase === 'Menstrual';

  return (
    <View style={styles.section}>
      {/* Main Period Action Button */}
      <TouchableOpacity 
        style={[
          styles.mainActionButton, 
          { backgroundColor: isPeriod ? Colors.fertility : Colors.period }
        ]} 
        onPress={isPeriod ? onEndPeriod : onStartPeriod}
        disabled={isActionLoading}
      >
        {isActionLoading ? (
          <ActivityIndicator color={Colors.card} />
        ) : (
          <>
            <CalendarIcon size={24} color={Colors.card} />
            <Text style={styles.mainActionLabel}>
              {isPeriod ? 'End Period' : 'Start Period'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.smallActionButton} onPress={onLogSymptoms}>
          <View style={[styles.smallActionIcon, { backgroundColor: Colors.fertility + '15' }]}>
            <Plus size={20} color={Colors.fertility} />
          </View>
          <Text style={styles.smallActionLabel}>Log Symptoms</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.smallActionButton} onPress={onAddNotes}>
          <View style={[styles.smallActionIcon, { backgroundColor: Colors.period + '15' }]}>
            <BookOpen size={20} color={Colors.period} />
          </View>
          <Text style={styles.smallActionLabel}>Add Notes</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.insightsButton} 
        onPress={onViewInsights}
      >
        <TrendingUp size={18} color={Colors.textSecondary} />
        <Text style={styles.insightsLabel}>View Detailed Insights</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: BorderRadius.xl,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  mainActionLabel: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  smallActionButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smallActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
  },
  insightsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
});
