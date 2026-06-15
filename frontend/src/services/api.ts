import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.10:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
      await AsyncStorage.setItem('token', response.data.access_token);
      // Force update the default header for the current instance
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },
  socialLogin: async (email: string) => {
    const response = await api.post(`/auth/social-login?email=${encodeURIComponent(email)}`);
    if (response.data.access_token) {
      await AsyncStorage.setItem('token', response.data.access_token);
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

  getPredictions: async () => {
    const response = await api.get('/health/predictions');
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
  }) => {
    const response = await api.post('/health/cycle-logs', data);
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
};

export default api;
