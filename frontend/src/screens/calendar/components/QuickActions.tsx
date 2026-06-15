import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon, Plus, TrendingUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

interface QuickActionsProps {
  onLogSymptoms: () => void;
  onViewCalendar?: () => void;
  onViewInsights?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onLogSymptoms, 
  onViewCalendar,
  onViewInsights
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onLogSymptoms}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
            <Plus size={24} color="#FFF" />
          </View>
          <Text style={styles.actionLabel}>{t('dashboard.log_symptoms')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onViewInsights}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.luteal }]}>
            <TrendingUp size={24} color="#FFF" />
          </View>
          <Text style={styles.actionLabel}>Insights</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
});
