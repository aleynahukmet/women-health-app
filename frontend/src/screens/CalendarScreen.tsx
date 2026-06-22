import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore } from '../store/useHealthStore';
import { useShallow } from 'zustand/react/shallow';
import { format, differenceInDays, parseISO, startOfMonth, endOfMonth, startOfDay, isSameDay } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { showToast } from '../utils/toast';
import { registerForPushNotificationsAsync, scheduleAllNotifications } from '../utils/notifications';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Colors, Spacing, BorderRadius } from '../theme/theme';

// Components
import { CalendarHeader } from './calendar/components/CalendarHeader';
import { StatusCard } from './calendar/components/StatusCard';
import { QuickActions } from './calendar/components/QuickActions';
import { InsightCard } from './calendar/components/InsightCard';
import { PeriodModal } from './calendar/components/PeriodModal';
import { SymptomBottomSheet } from './calendar/components/SymptomBottomSheet';
import { WeeklyCalendar } from './calendar/components/WeeklyCalendar';
import { SettingsModal } from './calendar/components/SettingsModal';
import BottomSheet from '@gorhom/bottom-sheet';

// Constants
import { PHASE_INSIGHTS } from './calendar/constants';

export default function CalendarScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Dashboard'>) {
  const profile = useHealthStore((state) => state.profile);
  const predictions = useHealthStore((state) => state.predictions);
  const cycleLogs = useHealthStore((state) => state.cycleLogs);
  const symptomHistory = useHealthStore((state) => state.symptomHistory);
  const loading = useHealthStore((state) => state.loading);
  const fetchProfile = useHealthStore((state) => state.fetchProfile);
  const fetchPredictions = useHealthStore((state) => state.fetchPredictions);
  const fetchCycleLogs = useHealthStore((state) => state.fetchCycleLogs);
  const fetchHistory = useHealthStore((state) => state.fetchHistory);
  const upsertSymptomLog = useHealthStore((state) => state.upsertSymptomLog);
  const logCycle = useHealthStore((state) => state.logCycle);
  const deleteMyData = useHealthStore((state) => state.deleteMyData);

  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [viewDate, setViewDate] = useState(startOfDay(new Date()));
  const [activeCategory, setActiveCategory] = useState('flow');
  const [isPeriodModalVisible, setIsPeriodModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  
  const [currentLog, setCurrentLog] = useState<any>({
    flow_level: 0,
    pain_metrics: {},
    mood_metrics: [],
    lifestyle_metrics: {},
    sex_logged: {},
  });

  const [isLogging, setIsLogging] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Period Logging Modal State
  const [modalStart, setModalStart] = useState<Date | null>(null);
  const [modalEnd, setModalEnd] = useState<Date | null>(null);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);

  // Bottom Sheet Refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
      fetchPredictions(format(viewDate, 'yyyy-MM-dd'));
      fetchCycleLogs();
      
      registerForPushNotificationsAsync();

      const start = format(startOfMonth(viewDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(viewDate), 'yyyy-MM-dd');
      fetchHistory(start, end);
    }, 0);
    return () => clearTimeout(timer);
  }, [viewDate]);

  useEffect(() => {
    if (predictions && profile?.notification_prefs) {
      scheduleAllNotifications(predictions, profile.notification_prefs);
    }
  }, [predictions, profile]);

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const log = symptomHistory[dateStr] || {
      flow_level: 0,
      pain_metrics: {},
      mood_metrics: [],
      lifestyle_metrics: {},
      sex_logged: {},
    };
    
    const timer = setTimeout(() => {
      setCurrentLog(log);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedDate, symptomHistory]);

  const handleOpenBottomSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bottomSheetRef.current?.expand();
  }, []);

  const handleOpenNotes = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveCategory('body');
    bottomSheetRef.current?.expand();
  }, []);

  const handleDateSelect = (day: Date) => {
    const normalizedDay = startOfDay(day);
    setSelectedDate(normalizedDay);
    Haptics.selectionAsync();
  };

  const handleOpenPeriodModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // If the clicked day is already within a logged period, load those dates for editing
    const existingLog = cycleLogs.find((log: any) => {
      const start = parseISO(log.start_date);
      const end = log.end_date ? parseISO(log.end_date) : start;
      return selectedDate >= start && selectedDate <= end;
    });

    if (existingLog) {
      setModalStart(parseISO(existingLog.start_date));
      setModalEnd(existingLog.end_date ? parseISO(existingLog.end_date) : null);
      setEditingLogId(existingLog.id); // Store the ID being edited
    } else {
      // IF NEW ENTRY: Open with null dates to prevent auto-selecting today
      setModalStart(null);
      setModalEnd(null);
      setEditingLogId(null); // New entry
    }
    setIsPeriodModalVisible(true);
  };

  const handleModalDatePress = (day: Date) => {
    const normalizedDay = startOfDay(day);
    Haptics.selectionAsync();
    
    if (!modalStart) {
      // Step 1: If no start date selected, set clicked day as start
      setModalStart(normalizedDay);
      setModalEnd(null);
    } else if (modalStart && !modalEnd) {
      // Step 2: If start exists but end doesn't
      if (normalizedDay < modalStart) {
        // ERROR PREVENTION/FLEXIBILITY: If user clicks a date BEFORE start,
        // update start date to that day! (Allows changing start date)
        setModalStart(normalizedDay);
      } else if (isSameDay(normalizedDay, modalStart)) {
        // Reset selection if clicking the same day
        setModalStart(null);
      } else {
        // Set as end date if clicking a date after start
        setModalEnd(normalizedDay);
      }
    } else {
      // Step 3: If both dates already selected, a new click resets and starts new selection
      setModalStart(normalizedDay);
      setModalEnd(null);
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
        intensity: 'medium',
        id: editingLogId || undefined // Send ID if exists, backend will update automatically
      });
      setIsPeriodModalVisible(false);
      await fetchPredictions(format(viewDate, 'yyyy-MM-dd'));
      await fetchCycleLogs();
      showToast.success('Period updated successfully');
    } catch (error) {
      showToast.error('Failed to save period.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleToggleSymptom = (categoryId: string, symptomId: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const prevLog = currentLog;
    let nextLog = { ...prevLog };
    switch (categoryId) {
      case 'flow':
        nextLog = { ...prevLog, flow_level: symptomId };
        break;
      case 'pain': {
        const currentLevel = prevLog.pain_metrics[symptomId] || 0;
        const nextLevel = (currentLevel + 1) % 4;
        const newPainMetrics = { ...prevLog.pain_metrics };
        if (nextLevel === 0) delete newPainMetrics[symptomId];
        else newPainMetrics[symptomId] = nextLevel;
        nextLog = { ...prevLog, pain_metrics: newPainMetrics };
        break;
      }
      case 'mood':
        nextLog = {
          ...prevLog,
          mood_metrics: prevLog.mood_metrics.includes(symptomId)
            ? prevLog.mood_metrics.filter((id: any) => id !== symptomId)
            : [...prevLog.mood_metrics, symptomId]
        };
        break;
      case 'energy':
      case 'body': {
        const currentLevel = prevLog.lifestyle_metrics[symptomId] || 0;
        const nextLevel = (currentLevel + 1) % 4;
        const newLifestyleMetrics = { ...prevLog.lifestyle_metrics };
        if (nextLevel === 0) delete newLifestyleMetrics[symptomId];
        else newLifestyleMetrics[symptomId] = nextLevel;
        nextLog = { ...prevLog, lifestyle_metrics: newLifestyleMetrics };
        break;
      }
      case 'sex': {
        const newSexLogged = { ...prevLog.sex_logged };
        if (newSexLogged[symptomId]) {
          delete newSexLogged[symptomId];
        } else {
          newSexLogged[symptomId] = true;
        }
        nextLog = { ...prevLog, sex_logged: newSexLogged };
        break;
      }
      default:
        break;
    }
    
    setCurrentLog(nextLog);
    
    // Auto-save logic - moved outside of the state update to avoid side effects during render/update
    upsertSymptomLog({
      log_date: format(selectedDate, 'yyyy-MM-dd'),
      ...nextLog
    }).catch(console.error);
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
      showToast.error('Failed to log. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleStartPeriod = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsActionLoading(true);
    try {
      await logCycle({
        start_date: format(new Date(), 'yyyy-MM-dd'),
        intensity: 'medium'
      });
      await fetchPredictions(format(viewDate, 'yyyy-MM-dd'));
      await fetchCycleLogs();
      showToast.success('Period started!');
    } catch (error) {
      showToast.error('Failed to start period');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndPeriod = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const activeLog = cycleLogs.find(log => !log.end_date);
    if (!activeLog) {
      setIsPeriodModalVisible(true);
      return;
    }

    setIsActionLoading(true);
    try {
      await logCycle({
        start_date: activeLog.start_date,
        end_date: format(new Date(), 'yyyy-MM-dd'),
        intensity: activeLog.intensity || 'medium'
      });
      await fetchPredictions(format(viewDate, 'yyyy-MM-dd'));
      await fetchCycleLogs();
      showToast.success('Period ended!');
    } catch (error) {
      showToast.error('Failed to end period');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setIsSettingsVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleDeleteData = async () => {
    await deleteMyData();
    setIsSettingsVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
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
  const themeColor = currentPhase === 'Menstrual' ? Colors.period : (currentPhase === 'Ovulatory' ? Colors.fertility : Colors.follicular);
  const insight = PHASE_INSIGHTS[currentPhase] || PHASE_INSIGHTS['Follicular'];

  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader 
        viewDate={viewDate}
        onSettingsPress={() => setIsSettingsVisible(true)}
      />

      <WeeklyCalendar 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        symptomHistory={symptomHistory}
      />

      <SettingsModal 
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onLogout={handleLogout}
        onDeleteData={handleDeleteData}
      />

      <PeriodModal 
        visible={isPeriodModalVisible}
        onClose={() => setIsPeriodModalVisible(false)}
        modalStart={modalStart}
        modalEnd={modalEnd}
        onDatePress={handleModalDatePress}
        onSave={handleSavePeriod}
        isLogging={isLogging}
        themeColor={themeColor}
        averagePeriodLength={profile?.average_period_length || 5}
        predictions={predictions}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <StatusCard 
          predictions={predictions}
          themeColor={themeColor}
          currentPhase={currentPhase}
          daysUntilPeriod={daysUntilPeriod}
          onExpand={() => setIsPeriodModalVisible(true)}
        />

        <QuickActions 
          onLogSymptoms={handleOpenBottomSheet}
          onLogPeriod={handleOpenPeriodModal}
          onViewInsights={() => navigation.navigate('Insights')}
          currentPhase={currentPhase}
          onStartPeriod={handleStartPeriod}
          onEndPeriod={handleEndPeriod}
          onAddNotes={handleOpenNotes}
          isActionLoading={isActionLoading}
          predictions={predictions}
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
