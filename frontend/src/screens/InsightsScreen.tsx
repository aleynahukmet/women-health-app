import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore } from '../store/useHealthStore';
import { useTranslation } from 'react-i18next';
import { Lightbulb, TrendingUp, Fingerprint, Activity } from 'lucide-react-native';

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
          <ActivityIndicator size="large" color="#A29BFE" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wellness Trends</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Lightbulb size={20} color="#FF9F43" />
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
              <Fingerprint size={20} color="#A29BFE" />
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
            <Activity size={20} color="#FF7675" />
            <Text style={styles.sectionTitle}>Phase Correlations</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {insights?.phase_correlations?.map((correlation: any, index: number) => (
              <View key={index} style={styles.phaseCard}>
                <Text style={styles.phaseName}>{correlation.phase}</Text>
                {correlation.top_symptoms.map((s: any, sIndex: number) => (
                  <View key={sIndex} style={styles.miniSymptom}>
                    <Text style={styles.miniSymptomLabel}>{s.id.replace("_", " ").title()}</Text>
                    <Text style={styles.miniSymptomValue}>{s.percentage}%</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Coming Soon / More Insights */}
        <View style={styles.infoBox}>
          <TrendingUp size={20} color="#636E72" />
          <Text style={styles.infoBoxText}>
            More insights like Symptom-Symptom Pairing and Proactive Warnings are coming soon as you log more data!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper for title case
String.prototype.title = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  insightCard: {
    backgroundColor: '#FFF9F1',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF9F43',
    marginLeft: 8,
    letterSpacing: 1,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2D3436',
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
    color: '#2D3436',
    marginLeft: 10,
  },
  fingerprintCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
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
    color: '#2D3436',
  },
  symptomPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A29BFE',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F1F2F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A29BFE',
    borderRadius: 4,
  },
  horizontalScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  phaseCard: {
    width: width * 0.4,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  phaseName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF7675',
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
    color: '#636E72',
  },
  miniSymptomValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3436',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#636E72',
    marginLeft: 12,
    lineHeight: 18,
  },
});
