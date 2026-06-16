import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, isSameDay, addDays, eachDayOfInterval, parseISO } from 'date-fns';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

interface PeriodModalProps {
  visible: boolean;
  onClose: () => void;
  modalStart: Date | null;
  modalEnd: Date | null;
  onDatePress: (date: Date) => void;
  onSave: () => void;
  isLogging: boolean;
  themeColor: string;
  averagePeriodLength?: number;
  predictions?: any;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({
  visible,
  onClose,
  modalStart,
  modalEnd,
  onDatePress,
  onSave,
  isLogging,
  themeColor,
  averagePeriodLength = 5,
  predictions,
}) => {
  const markedDates = useMemo(() => {
    const marks: any = {};

    // 1. Add Predictions (Fertile Window & Ovulation) - Subtle background
    if (predictions?.current_cycle) {
      const fertileStart = parseISO(predictions.current_cycle.fertile_window.start);
      const fertileEnd = parseISO(predictions.current_cycle.fertile_window.end);
      const ovulationDate = parseISO(predictions.ovulation_date);

      const fertileRange = eachDayOfInterval({ start: fertileStart, end: fertileEnd });
      fertileRange.forEach((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isOvulation = isSameDay(day, ovulationDate);
        
        marks[dateStr] = {
          color: isOvulation ? Colors.fertility + '30' : Colors.fertility + '10',
          textColor: isOvulation ? Colors.fertility : Colors.textSecondary,
        };
      });
    }
    
    // 2. Add Period Selection (Overrides predictions)
    if (modalStart) {
      const startStr = format(modalStart, 'yyyy-MM-dd');
      
      if (modalEnd) {
        const endStr = format(modalEnd, 'yyyy-MM-dd');
        
        if (startStr === endStr) {
          marks[startStr] = {
            startingDay: true,
            endingDay: true,
            color: Colors.period,
            textColor: Colors.card
          };
        } else {
          const range = eachDayOfInterval({
            start: modalStart,
            end: modalEnd
          });

          range.forEach((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isFirst = index === 0;
            const isLast = index === range.length - 1;
            
            marks[dateStr] = {
              startingDay: isFirst,
              endingDay: isLast,
              color: (isFirst || isLast) ? Colors.period : Colors.period + '40',
              textColor: (isFirst || isLast) ? Colors.card : Colors.period,
            };
          });
        }
      } else {
        // Only start date selected - show estimated range as a guide
        const estimatedEnd = addDays(modalStart, averagePeriodLength - 1);
        const range = eachDayOfInterval({
          start: modalStart,
          end: estimatedEnd
        });

        range.forEach((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isFirst = index === 0;
          
          marks[dateStr] = {
            startingDay: isFirst,
            endingDay: index === range.length - 1,
            color: isFirst ? Colors.period : Colors.period + '20',
            textColor: isFirst ? Colors.card : Colors.period,
          };
        });
      }
    }
    
    return marks;
  }, [modalStart, modalEnd, averagePeriodLength, predictions]);

  const selectionText = useMemo(() => {
    if (!modalStart) return 'Select start date';
    if (!modalEnd) return `${format(modalStart, 'MMM d')} - Select end date`;
    return `${format(modalStart, 'MMM d')} - ${format(modalEnd, 'MMM d')}`;
  }, [modalStart, modalEnd]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Update Period Log</Text>
              <Text style={styles.subtitle}>{selectionText}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Calendar
            markingType={'period'}
            markedDates={markedDates}
            onDayPress={(day: any) => {
              onDatePress(new Date(day.timestamp));
            }}
            enableSwipeMonths={true}
            theme={{
              calendarBackground: Colors.card,
              textSectionTitleColor: Colors.textLight,
              selectedDayBackgroundColor: Colors.period,
              selectedDayTextColor: Colors.card,
              todayTextColor: Colors.period,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.border, // Dimmed days from other months
              dotColor: Colors.period,
              selectedDotColor: Colors.card,
              arrowColor: Colors.period,
              monthTextColor: Colors.text,
              indicatorColor: Colors.period,
              textDayFontWeight: '500',
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12,
              'stylesheet.calendar.header': {
                week: {
                  marginTop: 15,
                  flexDirection: 'row',
                  justifyContent: 'space-around'
                }
              }
            }}
          />

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveBtn, (!modalStart || !modalEnd) && styles.saveBtnDisabled]} 
              onPress={onSave}
              disabled={!modalStart || !modalEnd || isLogging}
            >
              {isLogging ? (
                <ActivityIndicator color={Colors.card} />
              ) : (
                <Text style={styles.saveBtnText}>
                  {!modalStart ? 'Select Dates' : (!modalEnd ? 'Select End Date' : 'Save Period Data')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.period,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  saveBtn: {
    backgroundColor: Colors.period,
    padding: 18,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: Colors.period,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
