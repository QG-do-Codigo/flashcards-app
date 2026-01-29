export type DeckStats = {
  totalCards: number;
  dueCards: number;
  averageDifficulty: number;
  sessions: number;
  todaySession?: {
    cardsReviewed: number;
    correctAnswers: number;
  };
};
