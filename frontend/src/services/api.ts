import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // Refreshed import to trigger Metro re-scan
import { resetToWelcome } from '../utils/navigation';
import { showToast } from '../utils/toast';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.8:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized request, clearing session...');
      // Clear token and redirect to Welcome
      await SecureStore.deleteItemAsync('token');
      delete api.defaults.headers.common['Authorization'];
      
      showToast.error('Session expired', 'Please log in again to continue.');
      resetToWelcome();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: any) => {
    // FastAPI OAuth2 expects application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', data.username);
    params.append('password', data.password);
    
    const response = await api.post('/auth/login', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    if (response.data.access_token) {
      await SecureStore.setItemAsync('token', response.data.access_token);
      // Force update the default header for the current instance
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common['Authorization'];
  },
  socialLogin: async (email: string) => {
    const response = await api.post(`/auth/social-login?email=${encodeURIComponent(email)}`);
    if (response.data.access_token) {
      await SecureStore.setItemAsync('token', response.data.access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  }
};

export const healthApi = {
  saveProfile: async (data: any) => {
    const response = await api.post('/health/profile', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/health/profile');
    return response.data;
  },

  getPredictions: async (evaluationDate?: string) => {
    const url = evaluationDate ? `/health/predictions?evaluation_date=${evaluationDate}` : '/health/predictions';
    const response = await api.get(url);
    return response.data;
  },

  logSymptom: async (data: {
    date: string;
    symptom_type: string;
    value?: string;
  }) => {
    const response = await api.post('/health/symptoms', data);
    return response.data;
  },

  getSymptoms: async () => {
    const response = await api.get('/health/symptoms');
    return response.data;
  },

  upsertSymptomLog: async (data: {
    log_date: string;
    flow_level?: number;
    pain_metrics?: Record<string, number>;
    mood_metrics?: string[];
    lifestyle_metrics?: Record<string, any>;
    sex_logged?: Record<string, any>;
  }) => {
    const response = await api.post('/health/log', data);
    return response.data;
  },

  getHistory: async (startDate: string, endDate: string) => {
    const response = await api.get(`/health/history?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  },

  saveCycleLog: async (data: {
    start_date: string;
    end_date?: string;
    intensity?: string;
    id?: number; // Update support
  }) => {
    const url = data.id ? `/health/cycle-logs?id=${data.id}` : '/health/cycle-logs';
    const response = await api.post(url, data);
    return response.data;
  },

  getCycleLogs: async () => {
    const response = await api.get('/health/cycle-logs');
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/health/insights');
    return response.data;
  },

  deleteMyData: async () => {
    const response = await api.delete('/health/data');
    return response.data;
  },

  getDoctorReport: async () => {
    const response = await api.get('/health/report', {
      responseType: 'blob',
    });
    return response.data;
  },

  exportData: async () => {
    const response = await api.get('/health/export');
    return response.data;
  },

  importData: async (data: any) => {
    const response = await api.post('/health/import', data);
    return response.data;
  },
};

export default api;
