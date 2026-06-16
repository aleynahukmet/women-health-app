import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore } from '../store/useHealthStore';
import { useShallow } from 'zustand/react/shallow';
import { format, differenceInDays, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay } from 'date-fns';
// import BottomSheet from '@gorhom/bottom-sheet';
const BottomSheet: any = View;
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { showToast } from '../utils/toast';
import { registerForPushNotificationsAsync, schedulePeriodReminder } from '../utils/notifications';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

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
  } = useHealthStore(useShallow((state) => ({
    profile: state.profile,
    predictions: state.predictions,
    cycleLogs: state.cycleLogs,
    symptomHistory: state.symptomHistory,
    loading: state.loading,
    fetchProfile: state.fetchProfile,
    fetchPredictions: state.fetchPredictions,
    fetchCycleLogs: state.fetchCycleLogs,
    fetchHistory: state.fetchHistory,
    upsertSymptomLog: state.upsertSymptomLog,
    logCycle: state.logCycle,
  })));

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
  const [modalStart, setModalStart] = useState<Date | null>(null);
  const [modalEnd, setModalEnd] = useState<Date | null>(null);

  // Bottom Sheet Ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);

  useEffect(() => {
    fetchProfile();
    fetchPredictions();
    fetchCycleLogs();
    
    // Setup notifications
    registerForPushNotificationsAsync();

    const start = format(startOfMonth(viewDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(viewDate), 'yyyy-MM-dd');
    fetchHistory(start, end);
  }, [viewDate]);

  useEffect(() => {
    if (predictions?.next_period_date) {
      schedulePeriodReminder(predictions.next_period_date);
    }
  }, [predictions]);

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

  const handleOpenBottomSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bottomSheetRef.current?.expand();
  }, []);

  const handleDateSelect = (day: Date) => {
    const normalizedDay = startOfDay(day);
    setSelectedDate(normalizedDay);
    Haptics.selectionAsync();
  };

  const handleOpenPeriodModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalStart(selectedDate);
    setModalEnd(null);
    setPeriodModalVisible(true);
  };

  const handleModalDatePress = (day: Date) => {
    const normalizedDay = startOfDay(day);
    Haptics.selectionAsync();
    
    if (!modalStart || (modalStart && modalEnd)) {
      setModalStart(normalizedDay);
      setModalEnd(null);
    } else if (normalizedDay < modalStart) {
      setModalStart(normalizedDay);
      setModalEnd(null);
    } else if (normalizedDay.getTime() === modalStart.getTime()) {
      setModalStart(null);
      setModalEnd(null);
    } else {
      setModalEnd(normalizedDay);
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
    
    setCurrentLog((prevLog: any) => {
      switch (categoryId) {
        case 'flow':
          return { ...prevLog, flow_level: symptomId };
          
        case 'pain': {
          const currentLevel = prevLog.pain_metrics[symptomId] || 0;
          const nextLevel = (currentLevel + 1) % 4;
          const newPainMetrics = { ...prevLog.pain_metrics };
          
          if (nextLevel === 0) {
            delete newPainMetrics[symptomId];
          } else {
            newPainMetrics[symptomId] = nextLevel;
          }
          
          return { ...prevLog, pain_metrics: newPainMetrics };
        }
          
        case 'mood':
          return {
            ...prevLog,
            mood_metrics: prevLog.mood_metrics.includes(symptomId)
              ? prevLog.mood_metrics.filter((id: any) => id !== symptomId)
              : [...prevLog.mood_metrics, symptomId]
          };
          
        case 'energy':
        case 'body': {
          const isLevelMetric = ['deep_sleep', 'insomnia', 'exhausted', 'restless'].includes(symptomId);
          const newLifestyleMetrics = { ...prevLog.lifestyle_metrics };
          
          if (isLevelMetric) {
            const currentLevel = prevLog.lifestyle_metrics[symptomId] || 0;
            const nextLevel = (currentLevel + 1) % 4;
            if (nextLevel === 0) {
              delete newLifestyleMetrics[symptomId];
            } else {
              newLifestyleMetrics[symptomId] = nextLevel;
            }
          } else {
            newLifestyleMetrics[symptomId] = !prevLog.lifestyle_metrics[symptomId];
          }
          
          return { ...prevLog, lifestyle_metrics: newLifestyleMetrics };
        }
          
        case 'sex':
          return {
            ...prevLog,
            sex_logged: {
              ...prevLog.sex_logged,
              [symptomId]: !prevLog.sex_logged[symptomId]
            }
          };
          
        default:
          return prevLog;
      }
    });
  };

  const handleUpdateNotes = (notes: string) => {
    setCurrentLog((prev: any) => ({ ...prev, notes }));
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
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const daysUntilPeriod = predictions 
    ? differenceInDays(parseISO(predictions.next_period_date), new Date()) 
    : 0;

  const currentPhase = predictions?.current_phase || 'Unknown';
  const themeColor = PHASE_COLORS[currentPhase] || Colors.primary;
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
        onDatePress={handleDateSelect}
        onPrevMonth={() => setViewDate(subMonths(viewDate, 1))}
        onNextMonth={() => setViewDate(addMonths(viewDate, 1))}
      />

      <PeriodModal 
        visible={periodModalVisible}
        onClose={() => setPeriodModalVisible(false)}
        modalStart={modalStart}
        modalEnd={modalEnd}
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
          onLogPeriod={handleOpenPeriodModal}
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
        onUpdateNotes={handleUpdateNotes}
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
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
  },
});
