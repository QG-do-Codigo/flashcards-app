import api from '../lib/api';
import type { StudySession } from '../types';

export interface UpdateSessionPayload {
  cardsReviewed: number;
  correctAnswers: number;
  duration: number;
  completed: boolean;
  notes?: string;
}

export const studyApi = {
  startSession: (deckId: string) =>
    api.post<StudySession>('/study/sessions', { deckId }).then((r) => r.data),

  getSessions: (params?: { deckId?: string; limit?: number }) =>
    api.get<StudySession[]>('/study/sessions', { params }).then((r) => r.data),

  updateSession: (id: string, payload: UpdateSessionPayload) =>
    api.patch<StudySession>(`/study/sessions/${id}`, payload).then((r) => r.data),
};
