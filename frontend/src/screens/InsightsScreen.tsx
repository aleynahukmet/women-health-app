import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore } from '../store/useHealthStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { Lightbulb, TrendingUp, Fingerprint, Activity, BookOpen } from 'lucide-react-native';
import { SymptomTrendChart } from './calendar/components/SymptomTrendChart';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const { t } = useTranslation();
  const { insights, loading, fetchInsights } = useHealthStore(useShallow((state) => ({
    insights: state.insights,
    loading: state.loading,
    fetchInsights: state.fetchInsights,
  })));

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading && !insights) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const toTitleCase = (str: string) => {
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wellness Trends</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Smart Cycle Comparison */}
        {insights?.average_cycle_length && insights?.current_cycle_length && (
          <View style={styles.comparisonCard}>
            <TrendingUp size={24} color={Colors.primary} />
            <View style={styles.comparisonTextWrapper}>
              <Text style={styles.comparisonTitle}>Cycle Analysis</Text>
              <Text style={styles.comparisonText}>
                Your current cycle is{' '}
                <Text style={{ fontWeight: '800', color: Colors.primary }}>
                  {Math.abs(insights.current_cycle_length - insights.average_cycle_length)} days{' '}
                  {insights.current_cycle_length > insights.average_cycle_length ? 'longer' : 'shorter'}
                </Text>{' '}
                than your average ({insights.average_cycle_length} days). This is normal variation!
              </Text>
            </View>
          </View>
        )}

        {/* Daily Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Lightbulb size={20} color={Colors.ovulation} />
            <Text style={styles.insightTag}>GAIA INSIGHT</Text>
          </View>
          <Text style={styles.insightText}>
            "{insights?.daily_insight || 'Keep logging your symptoms to see more patterns!'}"
          </Text>
        </View>

        {/* Symptom Fingerprints */}
        {insights?.symptom_fingerprints?.map((fingerprint: any, index: number) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Fingerprint size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{fingerprint.title}</Text>
            </View>
            <View style={styles.fingerprintCard}>
              {fingerprint.symptoms.map((symptom: any, sIndex: number) => (
                <View key={sIndex} style={styles.symptomRow}>
                  <View style={styles.symptomInfo}>
                    <Text style={styles.symptomLabel}>{symptom.label}</Text>
                    <Text style={styles.symptomPercentage}>{symptom.percentage}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${symptom.percentage}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Symptom Trends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Symptom Trends (Last 3 Months)</Text>
          </View>
          
          <SymptomTrendChart 
            title="Cramps Intensity" 
            color={Colors.menstrual}
            data={[
              { label: 'April', value: 4 },
              { label: 'May', value: 7 },
              { label: 'June', value: 5 },
            ]}
          />

          <SymptomTrendChart 
            title="Mood Stability" 
            color={Colors.follicular}
            data={[
              { label: 'April', value: 8 },
              { label: 'May', value: 6 },
              { label: 'June', value: 9 },
            ]}
          />
        </View>

        {/* Phase Correlations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Phase Correlations</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {insights?.phase_correlations?.map((correlation: any, index: number) => (
              <View key={index} style={styles.phaseCard}>
                <Text style={styles.phaseName}>{correlation.phase}</Text>
                {correlation.top_symptoms.map((s: any, sIndex: number) => (
                  <View key={sIndex} style={styles.miniSymptom}>
                    <Text style={styles.miniSymptomLabel}>
                      {t(`symptoms.${s.id}`, { defaultValue: toTitleCase(s.id) })}
                    </Text>
                    <Text style={styles.miniSymptomValue}>{s.percentage}%</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Journal Entries */}
        {insights?.recent_notes && insights.recent_notes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Recent Journal Entries</Text>
            </View>
            {insights.recent_notes.map((note: any, index: number) => (
              <View key={index} style={[styles.journalCard, index > 0 && { marginTop: 12 }]}>
                <Text style={styles.journalDate}>{note.date}</Text>
                <Text style={styles.journalText}>"{note.text}"</Text>
              </View>
            ))}
          </View>
        )}

        {/* Coming Soon / More Insights */}
        <View style={styles.infoBox}>
          <TrendingUp size={20} color={Colors.textSecondary} />
          <Text style={styles.infoBoxText}>
            More insights like Symptom-Symptom Pairing and Proactive Warnings are coming soon as you log more data!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper for title case removed from prototype
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  comparisonCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '15',
    padding: 20,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  comparisonTextWrapper: {
    marginLeft: 16,
    flex: 1,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  insightCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.ovulation,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTag: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.ovulation,
    marginLeft: 8,
    letterSpacing: 1,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 10,
  },
  fingerprintCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  symptomRow: {
    marginBottom: 16,
  },
  symptomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  symptomLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  symptomPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  horizontalScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  phaseCard: {
    width: width * 0.4,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginRight: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  phaseName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
      miniSymptom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  miniSymptomLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  miniSymptomValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  journalCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  journalDate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  journalText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 12,
    lineHeight: 18,
  },
});
