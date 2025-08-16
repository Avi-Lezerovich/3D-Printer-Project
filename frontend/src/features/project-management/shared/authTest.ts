/**
 * Authentication Test Utility
 * Check if user is authenticated and can access protected endpoints
 */

import { apiFetch } from '../../../services/api';
import { useAuthStore } from '../../../core/state/authStore';

export const testAuth = async () => {
  console.info('Testing authentication status...');
  
  try {
    // Try to access a protected endpoint
    const response = await apiFetch('/api/v1/auth/me');
    console.info('Auth test - user:', response);
    return { authenticated: true, user: response };
  } catch (error) {
    console.error('Not authenticated or auth failed:', error);
    return { authenticated: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const loginWithTestUser = async () => {
  console.info('Attempting to login with test user...');
  const { login } = useAuthStore.getState();
  
  try {
    const success = await login('test@example.com', 'password123');
    if (success) {
      console.info('Test login successful');
      return true;
    } else {
      console.error('Test login failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};
