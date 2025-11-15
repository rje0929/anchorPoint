import axios from 'axios';
import { Provider } from '../types/provider';

// Remove trailing slash from API URL if present
const API_URL = (import.meta.env.VITE_APP_API_URL || 'http://localhost:3010').replace(/\/$/, '');

export const providerService = {
  async getAllProviders(): Promise<Provider[]> {
    const response = await axios.get(`${API_URL}/api/providers`);
    return response.data;
  },

  async getProviderById(id: number): Promise<Provider> {
    const response = await axios.get(`${API_URL}/api/providers/${id}`);
    return response.data;
  },

  async createProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    const response = await axios.post(`${API_URL}/api/providers`, provider);
    return response.data;
  },

  async updateProvider(id: number, provider: Partial<Provider>): Promise<Provider> {
    const response = await axios.put(`${API_URL}/api/providers/${id}`, provider);
    return response.data;
  },

  async deleteProvider(id: number): Promise<void> {
    await axios.delete(`${API_URL}/api/providers/${id}`);
  }
};
