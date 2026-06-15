import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon, Plus, TrendingUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

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
          <View style={[styles.actionIcon, { backgroundColor: '#FF7675' }]}>
            <Plus size={24} color="#FFF" />
          </View>
          <Text style={styles.actionLabel}>{t('dashboard.log_symptoms')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onViewInsights}>
          <View style={[styles.actionIcon, { backgroundColor: '#A29BFE' }]}>
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
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
});
