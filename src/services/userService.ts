import axios from 'axios';
import { DbUserProfile, UserRole } from '../types/auth';
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

export interface SyncUserResponse extends DbUserProfile {
  isNewUser: boolean;
}

export const userService = {
  // Sync user profile on login (create if not exists)
  async syncUser(): Promise<SyncUserResponse> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/users/sync`, {}, { headers });
    return response.data;
  },

  // Get current user profile
  async getCurrentUser(): Promise<DbUserProfile> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/users/me`, { headers });
    return response.data;
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<DbUserProfile[]> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/users`, { headers });
    return response.data;
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, role: UserRole): Promise<DbUserProfile> {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/api/users/${userId}/role`, { role }, { headers });
    return response.data;
  },

  // Verify/approve user (admin only)
  async verifyUser(userId: string): Promise<DbUserProfile> {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/api/users/${userId}/verify`, {}, { headers });
    return response.data;
  },

  // Revoke access / unverify user (admin only)
  async unverifyUser(userId: string): Promise<DbUserProfile> {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/api/users/${userId}/unverify`, {}, { headers });
    return response.data;
  },

  // Delete user (admin only, READ_ONLY users only)
  async deleteUser(userId: string): Promise<void> {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_URL}/api/users/${userId}`, { headers });
  }
};
