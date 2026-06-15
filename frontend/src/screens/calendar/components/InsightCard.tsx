import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

interface InsightCardProps {
  insight: { title: string; desc: string };
  themeColor: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, themeColor }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('dashboard.insights')}</Text>
      <View style={[styles.insightCard, { borderLeftColor: themeColor }]}>
        <Text style={[styles.insightTitle, { color: themeColor }]}>{insight.title}</Text>
        <Text style={styles.insightDescription}>
          {insight.desc}
        </Text>
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
  insightCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
