import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SessionCompleteProps {
  stats: {
    totalCards: number;
    easy: number;
    good: number;
    hard: number;
    accuracy: number;
    timeSpent: string;
  };
  onContinue: () => void;
}

function getAccuracyEmoji(accuracy: number) {
  if (accuracy >= 90) return '🎉';
  if (accuracy >= 75) return '🎯';
  if (accuracy >= 60) return '👍';
  return '💪';
}

export function SessionComplete({ stats, onContinue }: SessionCompleteProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-3xl p-8"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{getAccuracyEmoji(stats.accuracy)}</div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('sessionComplete.title')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--background)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats.totalCards}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.cardsReviewed')}</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--background)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--success)' }}>{stats.accuracy}%</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.accuracy')}</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--background)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats.timeSpent}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.timeSpent')}</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--background)' }}>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>+{stats.totalCards * 10}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.xpEarned')}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm mb-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.performanceBreakdown')}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.easy')}</span>
              <span className="font-semibold ml-auto" style={{ color: 'var(--text-primary)' }}>{t('sessionComplete.cardCount', { count: stats.easy })}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.good')}</span>
              <span className="font-semibold ml-auto" style={{ color: 'var(--text-primary)' }}>{t('sessionComplete.cardCount', { count: stats.good })}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('sessionComplete.hard')}</span>
              <span className="font-semibold ml-auto" style={{ color: 'var(--text-primary)' }}>{t('sessionComplete.cardCount', { count: stats.hard })}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', boxShadow: 'var(--shadow-md)' }}
        >
          {t('sessionComplete.backToDashboard')}
        </button>
      </motion.div>
    </div>
  );
}
