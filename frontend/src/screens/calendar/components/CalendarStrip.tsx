import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, isSameDay, isWithinInterval, parseISO } from 'date-fns';

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
          <ChevronLeft size={20} color="#636E72" />
        </TouchableOpacity>
        <Text style={styles.stripMonthText}>{format(viewDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={onNextMonth}>
          <ChevronRight size={20} color="#636E72" />
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
                isSelected && { backgroundColor: themeColor, borderColor: themeColor },
                isPredictedPeriod && !isSelected && { borderColor: '#FF7675', borderWidth: 2, backgroundColor: '#FFF5F5' },
                isLoggedPeriod && { backgroundColor: '#FF7675', borderColor: '#FF7675' },
              ]}
            >
              <Text style={[styles.dayName, (isSelected || isLoggedPeriod) && { color: '#FFF' }]}>{format(day, 'EEE')}</Text>
              <Text style={[styles.dayNum, (isSelected || isLoggedPeriod) && { color: '#FFF' }]}>{format(day, 'd')}</Text>
              {isToday && !isSelected && !isLoggedPeriod && <View style={[styles.todayDot, { backgroundColor: themeColor }]} />}
              {symptomHistory[format(day, 'yyyy-MM-dd')] && !isLoggedPeriod && !isSelected && (
                <View style={[styles.logDot, { backgroundColor: themeColor }]} />
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  stripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  stripMonthText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
  calendarScroll: {
    paddingHorizontal: 16,
  },
  calendarDay: {
    width: 50,
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#F1F2F6',
    backgroundColor: '#F8F9FA',
  },
  dayName: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
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
