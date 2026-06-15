import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore } from '../store/useHealthStore';
import { useTranslation } from 'react-i18next';
import { Lightbulb, TrendingUp, Fingerprint, Activity } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const { t } = useTranslation();
  const { insights, loading, fetchInsights } = useHealthStore();

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
                    <Text style={styles.miniSymptomLabel}>{toTitleCase(s.id)}</Text>
                    <Text style={styles.miniSymptomValue}>{s.percentage}%</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

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
  },
  miniSymptomValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
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
