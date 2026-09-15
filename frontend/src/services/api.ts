import axios from 'axios';
import { HealthCheck, SummaryStats, HotspotRecord, PredictionInput, PredictionResult, BroadcastRequest, BroadcastResponse } from '../types';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

export const api = {
  checkHealth: async (): Promise<HealthCheck> => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  getSummary: async (): Promise<SummaryStats> => {
    const response = await axios.get(`${API_BASE_URL}/summary`);
    return response.data;
  },

  getHotspots: async (): Promise<HotspotRecord[]> => {
    const response = await axios.get(`${API_BASE_URL}/hotspots`);
    return response.data;
  },

  predictRisk: async (data: PredictionInput): Promise<PredictionResult> => {
    const response = await axios.post(`${API_BASE_URL}/predict`, data);
    return response.data;
  },

  broadcastAlert: async (data: BroadcastRequest): Promise<BroadcastResponse> => {
    const response = await axios.post(`${API_BASE_URL}/alerts/broadcast`, data);
    return response.data;
  },

  getMetrics: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/model-metrics`);
    return response.data;
  }
};
