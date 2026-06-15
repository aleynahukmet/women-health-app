import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#A29BFE',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
});
