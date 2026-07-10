import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, BookOpen, Target, Trophy } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { Locale } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { StatsCard } from '../components/dashboard/StatsCard';
import { DeckCard } from '../components/dashboard/DeckCard';
import type { DeckViewModel } from '../components/dashboard/DeckCard';
import { EditDeckModal } from '../components/dashboard/EditDeckModal';
import { AchievementBadge } from '../components/shared/AchievementBadge';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useDateLocale } from '../i18n/dateLocale';
import { decksApi } from '../api/decks';
import { badgesApi } from '../api/badges';
import { studyApi } from '../api/study';
import type { Deck, Badge } from '../types';

function toDeckViewModel(deck: Deck, dateLocale: Locale): DeckViewModel {
  const totalCards = deck._count.cards;
  const toReview = deck.dueCards ?? 0;
  const lastSession = deck.studySessions?.[0];
  return {
    id: deck.id,
    name: deck.name,
    color: deck.color,
    totalCards,
    toReview,
    lastStudied: lastSession ? formatDistanceToNow(new Date(lastSession.createdAt), { addSuffix: true, locale: dateLocale }) : undefined,
    progress: totalCards > 0 ? Math.round(((totalCards - toReview) / totalCards) * 100) : 0,
  };
}

export function DashboardPage() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const loadDashboard = async () => {
    const [decksData, badgesData, sessionsData] = await Promise.all([
      decksApi.getAll(),
      badgesApi.getAll(),
      studyApi.getSessions({ limit: 50 }),
    ]);
    setDecks(decksData);
    setBadges(badgesData);

    const completed = sessionsData.filter((s) => s.completed && s.cardsReviewed > 0);
    const totalReviewed = completed.reduce((sum, s) => sum + s.cardsReviewed, 0);
    const totalCorrect = completed.reduce((sum, s) => sum + s.correctAnswers, 0);
    setAccuracy(totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0);
  };

  useEffect(() => {
    loadDashboard()
      .catch(() => toast.error(t('dashboard.toastLoadFailed')))
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdateDeck = async (payload: { name: string; description?: string; color: string }) => {
    if (!editingDeck) return;
    try {
      const updated = await decksApi.update(editingDeck.id, payload);
      setDecks((prev) => prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)));
      toast.success(t('dashboard.toastDeckUpdated'));
      setEditingDeck(null);
    } catch {
      toast.error(t('dashboard.toastDeckUpdateFailed'));
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    if (!window.confirm(t('dashboard.confirmDeleteDeck', { name: deck.name }))) return;
    try {
      await decksApi.remove(deckId);
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      toast.success(t('dashboard.toastDeckDeleted'));
    } catch {
      toast.error(t('dashboard.toastDeckDeleteFailed'));
    }
  };

  if (isLoading) return <LoadingScreen />;

  const totalCards = decks.reduce((sum, d) => sum + d._count.cards, 0);
  const recentBadges = [...badges]
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 7);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.welcomeBack', { name: user?.name })}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.readyToLearn')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard iconEmoji="🔥" label={t('dashboard.currentStreak')} value={`${user?.streak ?? 0} ${t('common.days')}`} color="#EF4444" />
          <StatsCard icon={BookOpen} label={t('dashboard.totalCards')} value={totalCards} color="#3B82F6" />
          <StatsCard icon={Target} label={t('dashboard.accuracy')} value={`${accuracy}%`} color="#10B981" />
          <StatsCard icon={Trophy} label={t('dashboard.badgesEarned')} value={badges.length} color="#F59E0B" />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('dashboard.yourDecks')}</h2>
            <button
              onClick={() => navigate('/decks')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', boxShadow: 'var(--shadow-md)' }}
            >
              <Plus className="w-4 h-4" /> {t('dashboard.manageDecks')}
            </button>
          </div>
          {decks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={toDeckViewModel(deck, dateLocale)}
                  onStudy={(id) => navigate(`/study/${id}`)}
                  onManage={(id) => navigate(`/decks/${id}`)}
                  onEdit={() => setEditingDeck(deck)}
                  onDelete={handleDeleteDeck}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--surface)', border: '2px dashed var(--border-light)' }}>
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('dashboard.noDecksYet')}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard.createFirstDeck')}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('dashboard.recentAchievements')}</h2>
          <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
            {recentBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {recentBadges.map((badge) => (
                  <AchievementBadge
                    key={badge.id}
                    badge={{
                      id: badge.id,
                      name: badge.title,
                      icon: badge.icon,
                      description: badge.description,
                      color: badge.color ?? '#4F46E5',
                      unlocked: true,
                      date: format(new Date(badge.earnedAt), 'MMM d, yyyy', { locale: dateLocale }),
                    }}
                    size="md"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🏆</div>
                <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard.startStudyingForBadge')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingDeck && (
        <EditDeckModal deck={editingDeck} onClose={() => setEditingDeck(null)} onSave={handleUpdateDeck} />
      )}
    </div>
  );
}
