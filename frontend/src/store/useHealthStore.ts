import { create } from 'zustand';
import { healthApi } from '../services/api';
import { showToast } from '../utils/toast';

interface HealthState {
  profile: any | null;
  predictions: any | null;
  symptoms: any[];
  symptomHistory: Record<string, any>; // Cache by date string
  cycleLogs: any[];
  insights: any | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  fetchPredictions: () => Promise<void>;
  fetchSymptoms: () => Promise<void>;
  fetchHistory: (start: string, end: string) => Promise<void>;
  fetchCycleLogs: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  logSymptom: (symptom: { date: string; symptom_type: string; value?: string }) => Promise<void>;
  upsertSymptomLog: (data: any) => Promise<void>;
  logCycle: (cycle: { start_date: string; end_date?: string; intensity?: string }) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  profile: null,
  predictions: null,
  symptoms: [],
  symptomHistory: {},
  cycleLogs: [],
  insights: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await healthApi.getProfile();
      set({ profile, loading: false });
    } catch (error: any) {
      showToast.error('Failed to fetch profile', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchPredictions: async () => {
    set({ loading: true, error: null });
    try {
      const predictions = await healthApi.getPredictions();
      set({ predictions, loading: false });
    } catch (error: any) {
      showToast.error('Failed to fetch predictions', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchSymptoms: async () => {
    set({ loading: true, error: null });
    try {
      const symptoms = await healthApi.getSymptoms();
      const history = { ...get().symptomHistory };
      symptoms.forEach((s: any) => {
        history[s.log_date] = s;
      });
      set({ symptoms, symptomHistory: history, loading: false });
    } catch (error: any) {
      showToast.error('Failed to fetch symptoms', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchHistory: async (start, end) => {
    set({ loading: true, error: null });
    try {
      const historyData = await healthApi.getHistory(start, end);
      const history = { ...get().symptomHistory };
      historyData.forEach((s: any) => {
        history[s.log_date] = s;
      });
      set({ symptomHistory: history, loading: false });
    } catch (error: any) {
      showToast.error('Failed to fetch history', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchCycleLogs: async () => {
    set({ loading: true, error: null });
    try {
      const cycleLogs = await healthApi.getCycleLogs();
      set({ cycleLogs, loading: false });
    } catch (error: any) {
      showToast.error('Failed to fetch cycle logs', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchInsights: async () => {
    set({ loading: true, error: null });
    try {
      const insights = await healthApi.getInsights();
      set({ insights, loading: false });
    } catch (error: any) {
      showToast.error('Failed to fetch insights', error.message);
      set({ error: error.message, loading: false });
    }
  },

  logSymptom: async (symptom) => {
    // Legacy method, kept for compatibility if needed, but we should use upsertSymptomLog
    set({ loading: true, error: null });
    try {
      const newSymptom = await healthApi.logSymptom(symptom);
      set((state) => ({ 
        symptoms: [newSymptom, ...state.symptoms],
        loading: false 
      }));
      get().fetchPredictions();
    } catch (error: any) {
      showToast.error('Failed to log symptom', error.message);
      set({ error: error.message, loading: false });
    }
  },

  upsertSymptomLog: async (data) => {
    set({ loading: true, error: null });
    try {
      // Ensure we send clean data
      const payload = {
        log_date: data.log_date,
        flow_level: data.flow_level || 0,
        pain_metrics: data.pain_metrics || {},
        mood_metrics: data.mood_metrics || [],
        lifestyle_metrics: data.lifestyle_metrics || {},
        sex_logged: data.sex_logged || {},
      };
      const newLog = await healthApi.upsertSymptomLog(payload);
      const history = { ...get().symptomHistory };
      history[newLog.log_date] = newLog;
      set({ symptomHistory: history, loading: false });
      get().fetchPredictions();
    } catch (error: any) {
      showToast.error('Failed to update symptom log', error.message);
      set({ error: error.message, loading: false });
    }
  },

  logCycle: async (cycle) => {
    set({ loading: true, error: null });
    try {
      const newLog = await healthApi.saveCycleLog(cycle);
      set((state) => {
        // If the updated log exists in the list, remove old and insert new
        const newLogs = state.cycleLogs.filter(l => l.id !== newLog.id);
        newLogs.unshift(newLog);
        return { cycleLogs: newLogs, loading: false };
      });
      get().fetchPredictions();
      get().fetchCycleLogs();
    } catch (error: any) {
      showToast.error('Failed to log cycle', error.message);
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const profile = await healthApi.saveProfile(data);
      set({ profile, loading: false });
      get().fetchPredictions();
    } catch (error: any) {
      showToast.error('Failed to update profile', error.message);
      set({ error: error.message, loading: false });
    }
  },
}));
