import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

interface CalendarStripProps {
  viewDate: Date;
  selectedDate: Date;
  calendarDays: Date[];
  predictions: any;
  cycleLogs: any[];
  symptomHistory: Record<string, any>;
  themeColor: string;
  onDatePress: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  viewDate,
  selectedDate,
  calendarDays,
  predictions,
  cycleLogs,
  symptomHistory,
  themeColor,
  onDatePress,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <View style={styles.calendarStrip}>
      <View style={styles.stripHeader}>
        <TouchableOpacity onPress={onPrevMonth}>
          <ChevronLeft size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.stripMonthText}>{format(viewDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={onNextMonth}>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
        {calendarDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          // Check if this day is a predicted period day
          let isPredictedPeriod = false;
          if (predictions?.next_cycles) {
            isPredictedPeriod = predictions.next_cycles.some((cycle: any) => 
              isWithinInterval(day, {
                start: parseISO(cycle.start_date),
                end: parseISO(cycle.end_date)
              })
            );
          }

          // Check if this day is a logged period day
          const isLoggedPeriod = cycleLogs.some((log: any) => 
            isWithinInterval(day, {
              start: parseISO(log.start_date),
              end: log.end_date ? parseISO(log.end_date) : parseISO(log.start_date)
            })
          );

          return (
            <TouchableOpacity 
              key={index} 
              onPress={() => onDatePress(day)}
              style={[
                styles.calendarDay, 
                isSelected && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                isPredictedPeriod && !isSelected && { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.background, borderStyle: 'dashed' },
                isLoggedPeriod && { backgroundColor: Colors.primary, borderColor: Colors.primary, opacity: 0.8 },
              ]}
            >
              <Text style={[styles.dayName, (isSelected || isLoggedPeriod) && { color: Colors.card }]}>{format(day, 'EEE')}</Text>
              <Text style={[styles.dayNum, (isSelected || isLoggedPeriod) && { color: Colors.card }]}>{format(day, 'd')}</Text>
              {isToday && !isSelected && !isLoggedPeriod && <View style={[styles.todayDot, { backgroundColor: Colors.primary }]} />}
              {symptomHistory[format(day, 'yyyy-MM-dd')] && !isLoggedPeriod && !isSelected && (
                <View style={[styles.logDot, { backgroundColor: Colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarStrip: {
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: 12,
  },
  stripMonthText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calendarScroll: {
    paddingHorizontal: 16,
  },
  calendarDay: {
    width: 50,
    height: 70,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  dayName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  logDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    opacity: 0.5,
  },
});
