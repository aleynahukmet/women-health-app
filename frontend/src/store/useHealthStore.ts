import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { healthApi, authApi } from '../services/api';
import { showToast } from '../utils/toast';

interface OfflineAction {
  type: 'upsertSymptomLog' | 'logCycle' | 'updateProfile';
  data: any;
  timestamp: number;
}

interface HealthState {
  profile: any | null;
  predictions: any | null;
  symptoms: any[];
  symptomHistory: Record<string, any>; // Cache by date string
  cycleLogs: any[];
  insights: any | null;
  offlineQueue: OfflineAction[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  
  // Actions
  fetchProfile: () => Promise<void>;
  fetchPredictions: (evaluationDate?: string) => Promise<void>;
  fetchSymptoms: () => Promise<void>;
  fetchHistory: (start: string, end: string) => Promise<void>;
  fetchCycleLogs: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  logSymptom: (symptom: { date: string; symptom_type: string; value?: string }) => Promise<void>;
  upsertSymptomLog: (data: any) => Promise<void>;
  logCycle: (cycle: { start_date: string; end_date?: string; intensity?: string }) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  deleteMyData: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
  setOfflineStatus: (status: boolean) => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      profile: null,
      predictions: null,
      symptoms: [],
      symptomHistory: {},
      cycleLogs: [],
      insights: null,
      offlineQueue: [],
      loading: false,
      error: null,
      isOffline: false,

      setOfflineStatus: (status) => set({ isOffline: status }),

      fetchProfile: async () => {
        const { isOffline } = get();
        if (isOffline) return;

        if (!get().loading) set({ loading: true, error: null });
        try {
          const profile = await healthApi.getProfile();
          set({ profile, loading: false });
        } catch (error: any) {
          if (!get().isOffline) {
            showToast.error('Failed to fetch profile', error.message);
          }
          set({ error: error.message, loading: false });
        }
      },

      fetchPredictions: async (evaluationDate?: string) => {
        const { isOffline } = get();
        if (isOffline) return;

        if (!get().loading) set({ loading: true, error: null });
        try {
          // Always send the current local date if evaluationDate is not provided
          // to avoid server-side timezone shifts (e.g. server in UTC vs user in local time)
          const dateToSend = evaluationDate || new Date().toISOString().split('T')[0];
          const predictions = await healthApi.getPredictions(dateToSend);
          set({ predictions, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      fetchSymptoms: async () => {
        const { isOffline } = get();
        if (isOffline) return;

        if (!get().loading) set({ loading: true, error: null });
        try {
          const symptoms = await healthApi.getSymptoms();
          const history = { ...get().symptomHistory };
          symptoms.forEach((s: any) => {
            history[s.log_date] = s;
          });
          set({ symptoms, symptomHistory: history, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      fetchHistory: async (start, end) => {
        const { isOffline } = get();
        if (isOffline) return;

        if (!get().loading) set({ loading: true, error: null });
        try {
          const historyData = await healthApi.getHistory(start, end);
          const history = { ...get().symptomHistory };
          historyData.forEach((s: any) => {
            history[s.log_date] = s;
          });
          set({ symptomHistory: history, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      fetchCycleLogs: async () => {
        const { isOffline } = get();
        if (isOffline) return;

        if (!get().loading) set({ loading: true, error: null });
        try {
          const cycleLogs = await healthApi.getCycleLogs();
          set({ cycleLogs, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      fetchInsights: async () => {
        const { isOffline } = get();
        if (isOffline) return;

        set({ loading: true, error: null });
        try {
          const insights = await healthApi.getInsights();
          set({ insights, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      logSymptom: async (symptom) => {
        // Legacy method, redirect to upsert
        await get().upsertSymptomLog({
          log_date: symptom.date,
          pain_metrics: { [symptom.symptom_type]: 1 }
        });
      },

      upsertSymptomLog: async (data) => {
        const { isOffline, offlineQueue } = get();
        
        // Optimistic Update
        const history = { ...get().symptomHistory };
        const optimisticLog = {
          ...data,
          log_date: data.log_date,
          flow_level: data.flow_level || 0,
          pain_metrics: data.pain_metrics || {},
          mood_metrics: data.mood_metrics || [],
          lifestyle_metrics: data.lifestyle_metrics || {},
          sex_logged: data.sex_logged || {},
          isOptimistic: true
        };
        history[data.log_date] = optimisticLog;
        set({ symptomHistory: history });

        if (isOffline) {
          const newQueue = [...offlineQueue, { type: 'upsertSymptomLog', data, timestamp: Date.now() }];
          set({ offlineQueue: newQueue });
          showToast.info('Offline Mode', 'Changes saved locally and will sync when online.');
          return;
        }

        try {
          const newLog = await healthApi.upsertSymptomLog(data);
          history[newLog.log_date] = newLog;
          set({ symptomHistory: history });
          get().fetchPredictions();
        } catch (error: any) {
          // If request fails due to network, queue it
          const newQueue = [...offlineQueue, { type: 'upsertSymptomLog', data, timestamp: Date.now() }];
          set({ offlineQueue: newQueue, isOffline: true });
          showToast.info('Offline Mode', 'Network error. Changes queued for sync.');
        }
      },

      logCycle: async (cycle) => {
        const { isOffline, offlineQueue } = get();
        
        if (isOffline) {
          const newQueue = [...offlineQueue, { type: 'logCycle', data: cycle, timestamp: Date.now() }];
          set({ offlineQueue: newQueue });
          showToast.info('Offline Mode', 'Cycle logged locally.');
          return;
        }

        try {
          const newLog = await healthApi.saveCycleLog(cycle);
          set((state) => {
            const newLogs = state.cycleLogs.filter(l => l.id !== newLog.id);
            newLogs.unshift(newLog);
            return { cycleLogs: newLogs };
          });
          get().fetchPredictions();
          get().fetchCycleLogs();
        } catch (error: any) {
          const newQueue = [...offlineQueue, { type: 'logCycle', data: cycle, timestamp: Date.now() }];
          set({ offlineQueue: newQueue, isOffline: true });
        }
      },

      updateProfile: async (data) => {
        const { isOffline, offlineQueue } = get();
        if (isOffline) {
          set({ profile: { ...get().profile, ...data }, offlineQueue: [...offlineQueue, { type: 'updateProfile', data, timestamp: Date.now() }] });
          return;
        }
        try {
          const profile = await healthApi.saveProfile(data);
          set({ profile });
        } catch (error: any) {
          set({ offlineQueue: [...offlineQueue, { type: 'updateProfile', data, timestamp: Date.now() }], isOffline: true });
        }
      },

      syncOfflineData: async () => {
        const { offlineQueue, isOffline } = get();
        if (isOffline || offlineQueue.length === 0) return;

        set({ loading: true });
        const queue = [...offlineQueue].sort((a, b) => a.timestamp - b.timestamp);
        const failedActions: OfflineAction[] = [];

        for (const action of queue) {
          try {
            if (action.type === 'upsertSymptomLog') {
              await healthApi.upsertSymptomLog(action.data);
            } else if (action.type === 'logCycle') {
              await healthApi.saveCycleLog(action.data);
            } else if (action.type === 'updateProfile') {
              await healthApi.saveProfile(action.data);
            }
          } catch (e) {
            failedActions.push(action);
          }
        }

        set({ offlineQueue: failedActions, loading: false });
        if (failedActions.length === 0) {
          showToast.success('Sync Complete', 'All offline changes have been synchronized.');
          get().fetchProfile();
          get().fetchPredictions();
          get().fetchHistory(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          );
        }
      },

      deleteMyData: async () => {
        set({ loading: true, error: null });
        try {
          await healthApi.deleteMyData();
          await authApi.logout();
          set({ 
            profile: null, 
            predictions: null, 
            symptoms: [], 
            symptomHistory: {}, 
            cycleLogs: [], 
            insights: null,
            offlineQueue: [],
            loading: false 
          });
          showToast.success('All data has been permanently deleted');
        } catch (error: any) {
          showToast.error('Failed to delete data', error.message);
          set({ error: error.message, loading: false });
        }
      },
    }),
    {
      name: 'health-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        symptoms: state.symptoms,
        symptomHistory: state.symptomHistory,
        cycleLogs: state.cycleLogs,
        insights: state.insights,
        offlineQueue: state.offlineQueue,
      }),
    }
  )
);

// Initialize Network Listener
NetInfo.addEventListener(state => {
  const store = useHealthStore.getState();
  const wasOffline = store.isOffline;
  const isNowOnline = state.isConnected && state.isInternetReachable;
  
  store.setOfflineStatus(!isNowOnline);
  
  if (!wasOffline && !isNowOnline) {
    // Just went offline
  } else if (wasOffline && isNowOnline) {
    // Just came back online
    store.syncOfflineData();
  }
});
