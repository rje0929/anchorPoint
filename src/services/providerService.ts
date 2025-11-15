import axios from 'axios';
import { Provider } from '../types/provider';
import { supabase } from '../lib/supabase';

// Remove trailing slash from API URL if present
const API_URL = (import.meta.env.VITE_APP_API_URL || 'http://localhost:3010').replace(/\/$/, '');

// Helper function to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }

  return {
    Authorization: `Bearer ${session.access_token}`
  };
}

export const providerService = {
  async getAllProviders(): Promise<Provider[]> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/providers`, { headers });
    return response.data;
  },

  async getProviderById(id: number): Promise<Provider> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/providers/${id}`, { headers });
    return response.data;
  },

  async createProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/providers`, provider, { headers });
    return response.data;
  },

  async updateProvider(id: number, provider: Partial<Provider>): Promise<Provider> {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/api/providers/${id}`, provider, { headers });
    return response.data;
  },

  async deleteProvider(id: number): Promise<void> {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_URL}/api/providers/${id}`, { headers });
  }
};
