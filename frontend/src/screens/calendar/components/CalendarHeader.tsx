import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { format } from 'date-fns';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

interface CalendarHeaderProps {
  viewDate: Date;
  onSettingsPress?: () => void;
  greeting?: string;
  subtitle?: string;
  themeColor?: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewDate,
  onSettingsPress,
  greeting,
  subtitle,
  themeColor,
}) => {
  return (
    <View style={styles.header}>
      <View>
        {greeting ? (
          <>
            <Text style={[styles.greetingText, { color: themeColor }]}>{greeting}</Text>
            <Text style={styles.subtitleText}>{subtitle}</Text>
          </>
        ) : (
          <Text style={styles.dateText}>{format(viewDate, 'MMMM yyyy')}</Text>
        )}
      </View>
      <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
        <Settings size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
  },
});
