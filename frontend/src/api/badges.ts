import api from '../lib/api';
import type { Badge } from '../types';

export const badgesApi = {
  getAll: () => api.get<Badge[]>('/badges').then((r) => r.data),
};
