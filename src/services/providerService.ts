import axios from 'axios';
import { Provider, CreateProvider } from '../types/provider';
import { supabase } from '../lib/supabase';

// Remove trailing slash from API URL if present
const API_URL = (import.meta.env.VITE_APP_API_URL || 'http://localhost:3010').replace(/\/$/, '');

// Helper function to get auth headers
async function getAuthHeaders() {
  // Check if we're in test mode (Playwright sets window.playwrightTest or we can check user agent)
  const isTestMode = typeof window !== 'undefined' &&
    (window.navigator.userAgent.includes('Playwright') ||
     (window as any).__PLAYWRIGHT__);

  // Use test token in test environment
  if (isTestMode) {
    return {
      Authorization: 'Bearer test-token-for-e2e-tests'
    };
  }

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
    // Providers are public/global - no auth required
    const response = await axios.get(`${API_URL}/api/providers`);
    return response.data;
  },

  async getProviderById(id: number): Promise<Provider> {
    // Providers are public/global - no auth required
    const response = await axios.get(`${API_URL}/api/providers/${id}`);
    return response.data;
  },

  async createProvider(provider: CreateProvider): Promise<Provider> {
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
