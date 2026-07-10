import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X as XIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { FlashcardFlip } from './FlashcardFlip';
import { SessionComplete } from './SessionComplete';
import { useTheme } from '../../context/ThemeContext';
import type { Card, Difficulty } from '../../types';

interface SessionStats {
  totalCards: number;
  easy: number;
  good: number;
  hard: number;
  correctAnswers: number;
  accuracy: number;
  durationSeconds: number;
}

interface FlashcardStudyProps {
  deckName: string;
  cards: Card[];
  onRate: (card: Card, difficulty: Difficulty) => void;
  onComplete: (stats: SessionStats) => void;
  onExit: () => void;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = { hard: '#EF4444', good: '#F59E0B', easy: '#10B981' };

export function FlashcardStudy({ deckName, cards, onRate, onComplete, onExit }: FlashcardStudyProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [difficultyCount, setDifficultyCount] = useState({ easy: 0, good: 0, hard: 0 });
  const [showComplete, setShowComplete] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [feedback, setFeedback] = useState<{ difficulty: Difficulty; show: boolean }>({ difficulty: 'good', show: false });

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleDifficulty = (difficulty: Difficulty) => {
    onRate(currentCard, difficulty);
    setFeedback({ difficulty, show: true });
    setAnswered((prev) => new Set(prev).add(currentIndex));
    const nextCount = { ...difficultyCount, [difficulty]: difficultyCount[difficulty] + 1 };
    setDifficultyCount(nextCount);

    setTimeout(() => {
      setFeedback({ difficulty, show: false });
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        const correctAnswers = nextCount.good + nextCount.easy;
        const stats: SessionStats = {
          totalCards: cards.length,
          easy: nextCount.easy,
          good: nextCount.good,
          hard: nextCount.hard,
          correctAnswers,
          accuracy: Math.round((correctAnswers / cards.length) * 100),
          durationSeconds: Math.round((Date.now() - startTime) / 1000),
        };
        setShowComplete(true);
        onComplete(stats);
      }
    }, 800);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const formatTimeSpent = () => {
    const elapsed = Date.now() - startTime;
    return `${Math.floor(elapsed / 60000)}m ${Math.floor((elapsed % 60000) / 1000)}s`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderColor: 'var(--border-light)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{deckName}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('study.cardOf', { current: currentIndex + 1, total: cards.length })}
              </p>
            </div>
            <button onClick={onExit} className="p-2 rounded-lg transition-all hover:opacity-80" style={{ backgroundColor: 'var(--surface)' }}>
              <XIcon className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <FlashcardFlip card={currentCard} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-3 rounded-xl transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)' }}
          >
            <ChevronLeft className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
          </button>

          <div className="flex items-center gap-2">
            {cards.map((_, index) => (
              <div
                key={index}
                className="h-2 rounded-full transition-all"
                style={{
                  backgroundColor: index === currentIndex ? 'var(--primary)' : answered.has(index) ? 'var(--success)' : 'var(--border-light)',
                  width: index === currentIndex ? '24px' : '8px',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="p-3 rounded-xl transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)' }}
          >
            <ChevronRight className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        {isFlipped && !answered.has(currentIndex) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <p className="text-center mb-4" style={{ color: 'var(--text-secondary)' }}>{t('study.howWellDidYouKnow')}</p>
            <div className="grid grid-cols-3 gap-4">
              {(['hard', 'good', 'easy'] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => handleDifficulty(difficulty)}
                  className="py-4 px-6 rounded-xl font-semibold transition-all hover:scale-[1.05] active:scale-[0.98]"
                  style={{
                    backgroundColor: `${DIFFICULTY_COLORS[difficulty]}20`,
                    color: DIFFICULTY_COLORS[difficulty],
                    border: `2px solid ${DIFFICULTY_COLORS[difficulty]}`,
                  }}
                >
                  <div className="text-2xl mb-1">{difficulty === 'hard' ? '❌' : difficulty === 'good' ? '🔄' : '✅'}</div>
                  <div className="text-sm">{t(`study.${difficulty}`)}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {difficulty === 'hard' ? t('study.reviewSoon') : difficulty === 'good' ? t('study.reviewLater') : t('study.reviewMuchLater')}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {feedback.show && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-8xl" style={{ filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))' }}>
              {feedback.difficulty === 'hard' && '❌'}
              {feedback.difficulty === 'good' && '🔄'}
              {feedback.difficulty === 'easy' && '✅'}
            </div>
          </motion.div>
        )}
      </div>

      {showComplete && (
        <SessionComplete
          stats={{
            totalCards: cards.length,
            easy: difficultyCount.easy,
            good: difficultyCount.good,
            hard: difficultyCount.hard,
            accuracy: Math.round(((difficultyCount.easy + difficultyCount.good) / cards.length) * 100),
            timeSpent: formatTimeSpent(),
          }}
          onContinue={onExit}
        />
      )}
    </div>
  );
}
