import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FlashcardStudy } from '../components/flashcard/FlashcardStudy';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { decksApi } from '../api/decks';
import { cardsApi } from '../api/cards';
import { studyApi } from '../api/study';
import type { Card, Deck, Difficulty } from '../types';

const DIFFICULTY_SCORE: Record<Difficulty, number> = { hard: 1, good: 3, easy: 5 };

function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleTheme}
        className="p-3 rounded-xl transition-all hover:scale-105"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}

export function StudyPage() {
  const { t } = useTranslation();
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const counts = useRef({ cardsReviewed: 0, correctAnswers: 0 });

  useEffect(() => {
    if (!deckId) return;
    let cancelled = false;

    (async () => {
      try {
        const [deckData, dueCards] = await Promise.all([decksApi.getOne(deckId), cardsApi.getDue(deckId, 50)]);
        if (cancelled) return;
        setDeck(deckData);
        setCards(dueCards);

        if (dueCards.length > 0) {
          const session = await studyApi.startSession(deckId);
          if (!cancelled) setSessionId(session.id);
        }
      } catch {
        toast.error(t('study.toastLoadFailed'));
        navigate('/');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deckId, navigate]);

  const handleRate = (card: Card, difficulty: Difficulty) => {
    counts.current.cardsReviewed += 1;
    if (difficulty !== 'hard') counts.current.correctAnswers += 1;
    cardsApi.review(card.id, DIFFICULTY_SCORE[difficulty]).catch(() => {
      toast.error(t('study.toastReviewFailed', { front: card.front }));
    });
  };

  const handleComplete = async (stats: { durationSeconds: number }) => {
    if (!sessionId) return;
    try {
      await studyApi.updateSession(sessionId, {
        cardsReviewed: counts.current.cardsReviewed,
        correctAnswers: counts.current.correctAnswers,
        duration: stats.durationSeconds,
        completed: true,
      });
      await refreshUser();
    } catch {
      toast.error(t('study.toastSessionFailed'));
    }
  };

  const handleExit = () => navigate('/');

  if (cards === null) return <LoadingScreen />;

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
        <FloatingThemeToggle />
        <div className="text-center max-w-md">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('study.allCaughtUp')}</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {deck ? t('study.noCardsDueNamed', { deckName: deck.name }) : t('study.noCardsDue')}
          </p>
          <button
            onClick={handleExit}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', boxShadow: 'var(--shadow-md)' }}
          >
            {t('common.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FloatingThemeToggle />
      <FlashcardStudy deckName={deck?.name ?? 'Deck'} cards={cards} onRate={handleRate} onComplete={handleComplete} onExit={handleExit} />
    </>
  );
}
