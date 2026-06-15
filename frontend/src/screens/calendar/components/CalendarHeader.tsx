import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Settings, ChevronLeft } from 'lucide-react-native';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface CalendarHeaderProps {
  name: string;
  viewDate: Date;
  onMonthPress: () => void;
  onSettingsPress?: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  name,
  viewDate,
  onMonthPress,
  onSettingsPress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{t('dashboard.greeting', { name: name || 'there' })}</Text>
        <TouchableOpacity onPress={onMonthPress} style={styles.monthSelector}>
          <Text style={styles.dateText}>{format(viewDate, 'MMMM yyyy')}</Text>
          <ChevronLeft size={16} color="#2D3436" style={{ transform: [{ rotate: '-90deg' }], marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
        <Settings size={24} color="#2D3436" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#636E72',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F2F6',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
