export type Theme = 'light' | 'dark';

export type Difficulty = 'hard' | 'good' | 'easy';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  streak: number;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export interface Deck {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  dueCards?: number;
  _count: { cards: number };
  studySessions?: Array<{
    cardsReviewed: number;
    correctAnswers: number;
    createdAt: string;
  }>;
}

export interface Card {
  id: string;
  front: string;
  back: string;
  example?: string | null;
  audioUrl?: string | null;
  deckId: string;
  difficulty: number;
  nextReview: string;
  interval: number;
  easeFactor: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  deckId: string;
  cardsReviewed: number;
  correctAnswers: number;
  duration: number;
  completed: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deck?: { id: string; name: string; color: string };
}

export type BadgeType =
  | 'FIRST_DECK'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'STREAK_100'
  | 'PERFECT_SESSION'
  | 'FAST_LEARNER'
  | 'DECK_MASTER'
  | 'MARATHON';

export interface Badge {
  id: string;
  userId: string;
  type: BadgeType;
  title: string;
  description: string;
  icon: string;
  color?: string | null;
  earnedAt: string;
}
