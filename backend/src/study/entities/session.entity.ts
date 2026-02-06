export class StudySession {
  id: string;
  userId: string;
  deckId: string;
  cardsReviewed: number;
  correctAnswers: number;
  duration: number;
  completed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
