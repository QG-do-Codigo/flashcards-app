import api from '../lib/api';
import type { Deck, Card } from '../types';

export interface CreateDeckPayload {
  name: string;
  description?: string;
  color?: string;
}

export interface DeckStats {
  totalCards: number;
  dueCards: number;
  averageDifficulty: number;
  sessions: number;
  todaySession?: { cardsReviewed: number; correctAnswers: number };
}

export const decksApi = {
  getAll: () => api.get<Deck[]>('/decks').then((r) => r.data),

  getOne: (id: string) =>
    api.get<Deck & { cards: Card[] }>(`/decks/${id}`).then((r) => r.data),

  getDueCards: () =>
    api
      .get<{ totalDueCards: number; deckCounts: Record<string, number> }>('/decks/due-cards')
      .then((r) => r.data),

  getStats: (id: string) => api.get<DeckStats>(`/decks/${id}/stats`).then((r) => r.data),

  create: (payload: CreateDeckPayload) => api.post<Deck>('/decks', payload).then((r) => r.data),

  update: (id: string, payload: Partial<CreateDeckPayload>) =>
    api.patch<Deck>(`/decks/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/decks/${id}`),
};
