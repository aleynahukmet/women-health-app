import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, isSameDay, isWithinInterval, isAfter, isBefore, subMonths, addMonths } from 'date-fns';
import { Colors, Spacing, BorderRadius } from '../../../theme/theme';

interface PeriodModalProps {
  visible: boolean;
  onClose: () => void;
  modalViewDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  activeHandle: 'start' | 'end';
  setActiveHandle: (handle: 'start' | 'end') => void;
  modalStart: Date | null;
  modalEnd: Date | null;
  modalCalendarDays: Date[];
  onDatePress: (date: Date) => void;
  onSave: () => void;
  isLogging: boolean;
  themeColor: string;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({
  visible,
  onClose,
  modalViewDate,
  onPrevMonth,
  onNextMonth,
  activeHandle,
  setActiveHandle,
  modalStart,
  modalEnd,
  modalCalendarDays,
  onDatePress,
  onSave,
  isLogging,
  themeColor,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={styles.periodModalContent}>
          <View style={styles.periodModalHeader}>
            <TouchableOpacity onPress={onPrevMonth}>
              <ChevronLeft size={20} color="#636E72" />
            </TouchableOpacity>
            <Text style={styles.periodModalMonth}>{format(modalViewDate, 'MMMM yyyy')}</Text>
            <TouchableOpacity onPress={onNextMonth}>
              <ChevronRight size={20} color="#636E72" />
            </TouchableOpacity>
          </View>

          <View style={styles.handleSelector}>
            <TouchableOpacity 
              style={[styles.handleBtn, activeHandle === 'start' && styles.handleBtnActive]}
              onPress={() => setActiveHandle('start')}
            >
              <Text style={[styles.handleBtnText, activeHandle === 'start' && styles.handleBtnTextActive]}>
                {modalStart ? format(modalStart, 'MMM d') : 'Start Date'}
              </Text>
            </TouchableOpacity>
            <View style={styles.handleDivider} />
            <TouchableOpacity 
              style={[styles.handleBtn, activeHandle === 'end' && styles.handleBtnActive]}
              onPress={() => setActiveHandle('end')}
            >
              <Text style={[styles.handleBtnText, activeHandle === 'end' && styles.handleBtnTextActive]}>
                {modalEnd ? format(modalEnd, 'MMM d') : 'Select end date'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalGrid}>
            {modalCalendarDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              
              let isInRange = false;
              if (modalStart) {
                if (modalEnd) {
                  isInRange = isWithinInterval(day, { start: modalStart, end: modalEnd });
                } else {
                  isInRange = isSameDay(day, modalStart) || isAfter(day, modalStart);
                }
              }

              const isStart = modalStart && isSameDay(day, modalStart);
              const isEnd = modalEnd && isSameDay(day, modalEnd);

              return (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.modalDay,
                    isInRange && styles.modalDayInRange,
                    isStart && styles.modalDayStart,
                    isEnd && styles.modalDayEnd,
                  ]}
                  onPress={() => onDatePress(day)}
                >
                  <Text style={[
                    styles.modalDayText,
                    isInRange && styles.modalDayTextInRange,
                    isToday && !isInRange && { color: Colors.primary, fontWeight: '800' }
                  ]}>
                    {format(day, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
                <ActivityIndicator color="#FFF" />
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
  periodModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodModalMonth: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  handleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: 20,
    alignItems: 'center',
  },
  handleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  handleBtnActive: {
    backgroundColor: Colors.card,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  handleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  handleBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  handleDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  modalDay: {
    width: '14.28%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalDayInRange: {
    backgroundColor: Colors.primary + '20', // Light green background
  },
  modalDayStart: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  modalDayEnd: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  modalDayText: {
    fontSize: 14,
    color: Colors.text,
  },
  modalDayTextInRange: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.7,
  },
  modalSaveText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
