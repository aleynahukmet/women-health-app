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
}) => {
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    if (modalStart) {
      const startStr = format(modalStart, 'yyyy-MM-dd');
      
      if (modalEnd) {
        const endStr = format(modalEnd, 'yyyy-MM-dd');
        
        // If start and end are the same day
        if (startStr === endStr) {
          marks[startStr] = {
            startingDay: true,
            endingDay: true,
            color: Colors.menstrual,
            textColor: Colors.card
          };
        } else {
          // Fill the range
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
              color: (isFirst || isLast) ? Colors.menstrual : Colors.menstrual + '40',
              textColor: (isFirst || isLast) ? Colors.card : Colors.menstrual,
            };
          });
        }
      } else {
        // Only start date selected
        marks[startStr] = { 
          startingDay: true, 
          endingDay: true,
          color: Colors.menstrual, 
          textColor: Colors.card 
        };
      }
    }
    
    return marks;
  }, [modalStart, modalEnd]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={styles.periodModalContent}>
          <Text style={styles.periodModalTitle}>Log Period</Text>
          <Text style={styles.periodModalSubtitle}>Select the start and end dates of your period.</Text>

          <View style={styles.selectedDatesContainer}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Start</Text>
              <Text style={styles.dateValue}>
                {modalStart ? format(modalStart, 'MMM d, yyyy') : 'Select date'}
              </Text>
            </View>
            <View style={styles.dateSeparator} />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>End</Text>
              <Text style={styles.dateValue}>
                {modalEnd ? format(modalEnd, 'MMM d, yyyy') : 'Select date'}
              </Text>
            </View>
          </View>

          <Calendar
            markingType={'period'}
            markedDates={markedDates}
            onDayPress={(day: any) => {
              onDatePress(new Date(day.timestamp));
            }}
            theme={{
              calendarBackground: Colors.card,
              textSectionTitleColor: Colors.textSecondary,
              selectedDayBackgroundColor: Colors.menstrual,
              selectedDayTextColor: Colors.card,
              todayTextColor: Colors.menstrual,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.textLight,
              dotColor: Colors.menstrual,
              selectedDotColor: Colors.card,
              arrowColor: Colors.menstrual,
              monthTextColor: Colors.text,
              indicatorColor: Colors.menstrual,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
              'stylesheet.calendar.header': {
                week: {
                  marginTop: 15,
                  flexDirection: 'row',
                  justifyContent: 'space-around'
                }
              }
            }}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalCancelBtn} 
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalSaveBtn, (!modalStart || !modalEnd) && styles.modalSaveBtnDisabled]} 
              onPress={onSave}
              disabled={!modalStart || !modalEnd || isLogging}
            >
              {isLogging ? (
                <ActivityIndicator color={Colors.card} />
              ) : (
                <Text style={styles.modalSaveText}>Save Period</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodModalContent: {
    width: '90%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  periodModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  periodModalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  selectedDatesContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  dateSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 2,
    backgroundColor: Colors.menstrual,
    padding: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.7,
  },
  modalSaveText: {
    color: Colors.card,
    fontWeight: '700',
  },
});
