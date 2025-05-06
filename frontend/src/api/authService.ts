import apiClient from './apiClient';
import { User } from '../../../backend/src/modules/Users/entities/user.entity';

interface UserCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const loginUser = async (creds: UserCredentials) => {
  const res = await apiClient.post('/auth/login', creds);
  return res.data as { accessToken: string };
};

export const refreshToken = async () => {
  const res = await apiClient.post('/auth/refresh');
  return res.data as { accessToken: string };
};

export const logoutUser = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('accessToken');
    delete apiClient.defaults.headers?.['Authorization'];
  }
};

export const fetchMe = async (): Promise<User> => {
  const res = await apiClient.get('/auth/me');
  return res.data as User;
};
