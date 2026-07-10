import api from '../lib/api';
import type { Card } from '../types';

export interface ReviewCardResponse {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  interval: number;
  easeFactor: number;
  nextReview: string;
  reviewCount: number;
}

export const cardsApi = {
  getByDeck: (deckId: string) => api.get<Card[]>(`/cards/deck/${deckId}`).then((r) => r.data),

  getOne: (id: string) => api.get<Card>(`/cards/${id}`).then((r) => r.data),

  getDue: (deckId: string, limit?: number) =>
    api
      .get<Card[]>(`/cards/deck/${deckId}/due`, { params: limit ? { limit } : undefined })
      .then((r) => r.data),

  create: (deckId: string, payload: { front: string; back: string; example?: string; audioUrl?: string }) =>
    api.post<Card>(`/cards/deck/${deckId}`, payload).then((r) => r.data),

  update: (id: string, payload: Partial<{ front: string; back: string; example: string; audioUrl: string }>) =>
    api.patch<Card>(`/cards/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/cards/${id}`),

  review: (id: string, difficulty: number) =>
    api.post<ReviewCardResponse>(`/cards/${id}/review`, { difficulty }).then((r) => r.data),
};
