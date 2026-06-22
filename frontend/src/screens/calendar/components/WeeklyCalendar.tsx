import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH / 7;

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  symptomHistory: Record<string, any>;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedDate,
  onDateSelect,
  symptomHistory,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Generate a range of days around the selected date
  const days = React.useMemo(() => {
    const range = [];
    for (let i = -14; i <= 14; i++) {
      range.push(addDays(selectedDate, i));
    }
    return range;
  }, [selectedDate]);

  useEffect(() => {
    // Center the selected date
    const index = days.findIndex(d => isSameDay(d, selectedDate));
    if (index !== -1 && scrollViewRef.current) {
      const offset = (index * ITEM_WIDTH) - (SCREEN_WIDTH / 2) + (ITEM_WIDTH / 2);
      scrollViewRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasSymptoms = symptomHistory[dateStr];
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayItem, isSelected && styles.selectedDayItem]}
              onPress={() => onDateSelect(day)}
            >
              <Text style={[styles.dayName, isSelected && styles.selectedText]}>
                {format(day, 'EEE')}
              </Text>
              <View style={[styles.dateCircle, isSelected && styles.selectedDateCircle]}>
                <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                  {format(day, 'd')}
                </Text>
              </View>
              <View style={styles.dotContainer}>
                {hasSymptoms && <View style={styles.symptomDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  dayItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  selectedDayItem: {
    // Optional: background for selected item
  },
  dayName: {
    fontSize: 12,
    color: Colors.text, // Darkened for better visibility
    fontWeight: '700', // Increased weight
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateCircle: {
    backgroundColor: Colors.primary,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  selectedText: {
    color: Colors.card,
  },
  dotContainer: {
    height: 6,
    marginTop: 4,
    justifyContent: 'center',
  },
  symptomDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
});
