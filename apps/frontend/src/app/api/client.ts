import { AuthRepository, HttpClient } from '@ocj/api';
import { useAuthStore } from '../../features/auth/auth.store';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:6868/api/v1';

export const httpClient = new HttpClient({
  baseUrl,
  getAccessToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => useAuthStore.getState().clear(),
});

export const authRepository = new AuthRepository(httpClient);

