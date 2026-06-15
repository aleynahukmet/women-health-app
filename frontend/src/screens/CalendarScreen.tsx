import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore } from '../store/useHealthStore';
import { format, differenceInDays, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay } from 'date-fns';
import BottomSheet from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { showToast } from '../utils/toast';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Components
import { CalendarHeader } from './calendar/components/CalendarHeader';
import { CalendarStrip } from './calendar/components/CalendarStrip';
import { StatusCard } from './calendar/components/StatusCard';
import { QuickActions } from './calendar/components/QuickActions';
import { InsightCard } from './calendar/components/InsightCard';
import { PeriodModal } from './calendar/components/PeriodModal';
import { SymptomBottomSheet } from './calendar/components/SymptomBottomSheet';

// Constants
import { PHASE_COLORS, PHASE_INSIGHTS } from './calendar/constants';

export default function CalendarScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Dashboard'>) {
  const { 
    profile, 
    predictions, 
    cycleLogs,
    symptomHistory,
    loading, 
    fetchProfile, 
    fetchPredictions, 
    fetchCycleLogs,
    fetchHistory,
    upsertSymptomLog,
    logCycle
  } = useHealthStore();

  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [viewDate, setViewDate] = useState(startOfDay(new Date()));
  const [activeCategory, setActiveCategory] = useState('flow');
  
  const [currentLog, setCurrentLog] = useState<any>({
    flow_level: 0,
    pain_metrics: {},
    mood_metrics: [],
    lifestyle_metrics: {},
    sex_logged: {},
  });

  const [isLogging, setIsLogging] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Period Logging Modal State
  const [periodModalVisible, setPeriodModalVisible] = useState(false);
  const [modalViewDate, setModalViewDate] = useState(startOfDay(new Date()));
  const [modalStart, setModalStart] = useState<Date | null>(null);
  const [modalEnd, setModalEnd] = useState<Date | null>(null);
  const [activeHandle, setActiveHandle] = useState<'start' | 'end'>('end');

  // Bottom Sheet Ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);

  useEffect(() => {
    fetchProfile();
    fetchPredictions();
    fetchCycleLogs();
    
    const start = format(startOfMonth(viewDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(viewDate), 'yyyy-MM-dd');
    fetchHistory(start, end);
  }, [viewDate]);

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    if (symptomHistory[dateStr]) {
      setCurrentLog(symptomHistory[dateStr]);
    } else {
      setCurrentLog({
        flow_level: 0,
        pain_metrics: {},
        mood_metrics: [],
        lifestyle_metrics: {},
        sex_logged: {},
      });
    }
  }, [selectedDate, symptomHistory]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const modalCalendarDays = useMemo(() => {
    const start = startOfMonth(modalViewDate);
    const end = endOfMonth(modalViewDate);
    return eachDayOfInterval({ start, end });
  }, [modalViewDate]);

  const handleOpenBottomSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bottomSheetRef.current?.expand();
  }, []);

  const handleDatePress = (day: Date) => {
    const normalizedDay = startOfDay(day);
    setSelectedDate(normalizedDay);
    setModalStart(normalizedDay);
    setModalEnd(null);
    setModalViewDate(normalizedDay);
    setActiveHandle('end');
    setPeriodModalVisible(true);
  };

  const handleModalDatePress = (day: Date) => {
    const normalizedDay = startOfDay(day);
    Haptics.selectionAsync();
    
    if (activeHandle === 'start') {
      setModalStart(normalizedDay);
      if (modalEnd && normalizedDay > modalEnd) {
        setModalEnd(null);
      }
      setActiveHandle('end');
    } else {
      if (!modalStart || normalizedDay < modalStart) {
        setModalStart(normalizedDay);
        setModalEnd(null);
      } else if (normalizedDay.getTime() === modalStart.getTime()) {
        setModalStart(normalizedDay);
        setModalEnd(null);
      } else {
        setModalEnd(normalizedDay);
      }
    }
  };

  const handleSavePeriod = async () => {
    if (!modalStart || !modalEnd) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setIsLogging(true);
    try {
      await logCycle({
        start_date: format(modalStart, 'yyyy-MM-dd'),
        end_date: format(modalEnd, 'yyyy-MM-dd'),
        intensity: 'medium'
      });
      setPeriodModalVisible(false);
      showToast.success('Period saved successfully');
    } catch (error) {
      showToast.error('Failed to save period.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleToggleSymptom = (categoryId: string, symptomId: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLog = { ...currentLog };

    if (categoryId === 'flow') {
      newLog.flow_level = symptomId;
    } else if (categoryId === 'pain') {
      const currentLevel = newLog.pain_metrics[symptomId] || 0;
      const nextLevel = (currentLevel + 1) % 4;
      if (nextLevel === 0) delete newLog.pain_metrics[symptomId];
      else newLog.pain_metrics[symptomId] = nextLevel;
    } else if (categoryId === 'mood') {
      const index = newLog.mood_metrics.indexOf(symptomId);
      if (index >= 0) newLog.mood_metrics.splice(index, 1);
      else newLog.mood_metrics.push(symptomId);
    } else if (categoryId === 'energy' || categoryId === 'body') {
      if (['deep_sleep', 'insomnia', 'exhausted', 'restless'].includes(symptomId)) {
        const currentLevel = newLog.lifestyle_metrics[symptomId] || 0;
        const nextLevel = (currentLevel + 1) % 4;
        if (nextLevel === 0) delete newLog.lifestyle_metrics[symptomId];
        else newLog.lifestyle_metrics[symptomId] = nextLevel;
      } else {
        newLog.lifestyle_metrics[symptomId] = !newLog.lifestyle_metrics[symptomId];
      }
    } else if (categoryId === 'sex') {
      newLog.sex_logged[symptomId] = !newLog.sex_logged[symptomId];
    }

    setCurrentLog(newLog);
  };

  const handleSaveLog = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLogging(true);
    try {
      await upsertSymptomLog({
        log_date: format(selectedDate, 'yyyy-MM-dd'),
        ...currentLog
      });
      bottomSheetRef.current?.close();
      showToast.success('Symptoms logged');
    } catch (error) {
      console.error('Failed to log:', error);
      showToast.error('Failed to log. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  if (loading && !predictions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#A29BFE" />
        </View>
      </SafeAreaView>
    );
  }

  const daysUntilPeriod = predictions 
    ? differenceInDays(parseISO(predictions.next_period_date), new Date()) 
    : 0;

  const currentPhase = predictions?.current_phase || 'Unknown';
  const themeColor = PHASE_COLORS[currentPhase] || '#A29BFE';
  const insight = PHASE_INSIGHTS[currentPhase] || PHASE_INSIGHTS['Follicular'];

  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader 
        name={profile?.name}
        viewDate={viewDate}
        onMonthPress={() => setShowDatePicker(true)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={viewDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setViewDate(date);
          }}
        />
      )}

      <CalendarStrip 
        viewDate={viewDate}
        selectedDate={selectedDate}
        calendarDays={calendarDays}
        predictions={predictions}
        cycleLogs={cycleLogs}
        symptomHistory={symptomHistory}
        themeColor={themeColor}
        onDatePress={handleDatePress}
        onPrevMonth={() => setViewDate(subMonths(viewDate, 1))}
        onNextMonth={() => setViewDate(addMonths(viewDate, 1))}
      />

      <PeriodModal 
        visible={periodModalVisible}
        onClose={() => setPeriodModalVisible(false)}
        modalViewDate={modalViewDate}
        onPrevMonth={() => setModalViewDate(subMonths(modalViewDate, 1))}
        onNextMonth={() => setModalViewDate(addMonths(modalViewDate, 1))}
        activeHandle={activeHandle}
        setActiveHandle={setActiveHandle}
        modalStart={modalStart}
        modalEnd={modalEnd}
        modalCalendarDays={modalCalendarDays}
        onDatePress={handleModalDatePress}
        onSave={handleSavePeriod}
        isLogging={isLogging}
        themeColor={themeColor}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StatusCard 
          predictions={predictions}
          themeColor={themeColor}
          currentPhase={currentPhase}
          daysUntilPeriod={daysUntilPeriod}
        />

        <QuickActions 
          onLogSymptoms={handleOpenBottomSheet}
          onViewInsights={() => navigation.navigate('Insights')}
        />

        <InsightCard 
          insight={insight}
          themeColor={themeColor}
        />
      </ScrollView>

      <SymptomBottomSheet 
        ref={bottomSheetRef}
        selectedDate={selectedDate}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        currentLog={currentLog}
        onToggleSymptom={handleToggleSymptom}
        onSave={handleSaveLog}
        themeColor={themeColor}
        snapPoints={snapPoints}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
});
