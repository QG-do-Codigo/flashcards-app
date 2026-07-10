import api from '../lib/api';
import type { AuthResponse, AuthUser } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data),

  me: () => api.get<AuthUser>('/auth/me').then((r) => r.data),
};
