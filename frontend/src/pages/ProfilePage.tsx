import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Calendar, Award, TrendingUp } from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';
import { AchievementBadge, BADGE_CATALOG } from '../components/shared/AchievementBadge';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDateLocale } from '../i18n/dateLocale';
import { decksApi } from '../api/decks';
import { studyApi } from '../api/study';
import { badgesApi } from '../api/badges';
import type { Badge, StudySession } from '../types';

const XP_PER_CARD = 10;
const XP_PER_LEVEL = 1000;

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getIntensityColor(intensity: number) {
  if (intensity === 0) return 'var(--muted)';
  if (intensity === 1) return '#86efac';
  if (intensity === 2) return '#4ade80';
  if (intensity === 3) return '#22c55e';
  return '#16a34a';
}

export function ProfilePage() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'stats'>('overview');
  const [totalCards, setTotalCards] = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([decksApi.getAll(), studyApi.getSessions({ limit: 200 }), badgesApi.getAll()])
      .then(([decks, sessionsData, badgesData]) => {
        setTotalCards(decks.reduce((sum, d) => sum + d._count.cards, 0));
        setSessions(sessionsData);
        setBadges(badgesData);
      })
      .catch(() => toast.error(t('profile.toastLoadFailed')))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.completed && s.cardsReviewed > 0);
    const cardsReviewed = completed.reduce((sum, s) => sum + s.cardsReviewed, 0);
    const correct = completed.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      totalCards,
      cardsReviewed,
      accuracy: cardsReviewed > 0 ? Math.round((correct / cardsReviewed) * 100) : 0,
      streak: user?.streak ?? 0,
      totalStudyTime: formatDuration(totalDuration),
    };
  }, [sessions, totalCards, user]);

  const xp = stats.cardsReviewed * XP_PER_CARD;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp - (level - 1) * XP_PER_LEVEL;

  const weeklyProgress = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return days.map((day) => ({
      date: format(day, 'EEE', { locale: dateLocale }),
      cards: sessions
        .filter((s) => isSameDay(new Date(s.createdAt), day))
        .reduce((sum, s) => sum + s.cardsReviewed, 0),
    }));
  }, [sessions, dateLocale]);
  const maxWeeklyCards = Math.max(1, ...weeklyProgress.map((d) => d.cards));

  const streakCalendar = useMemo(() => {
    const days = Array.from({ length: 90 }, (_, i) => subDays(new Date(), 89 - i));
    return days.map((day) => {
      const cardsThatDay = sessions
        .filter((s) => isSameDay(new Date(s.createdAt), day))
        .reduce((sum, s) => sum + s.cardsReviewed, 0);
      const intensity = cardsThatDay === 0 ? 0 : cardsThatDay < 5 ? 1 : cardsThatDay < 10 ? 2 : cardsThatDay < 20 ? 3 : 4;
      return { day, intensity, cardsThatDay };
    });
  }, [sessions]);

  const recentSessions = useMemo(
    () => [...sessions].filter((s) => s.completed).slice(0, 8),
    [sessions],
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', borderColor: 'var(--border-light)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-80" style={{ backgroundColor: 'var(--surface)' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            <span style={{ color: 'var(--text-primary)' }}>{t('common.backToDashboard')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-3xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', boxShadow: 'var(--shadow-xl)' }}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl">👤</div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
              <p className="text-white/80 mb-4">{user?.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{t('profile.streakDays', { count: stats.streak })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">{t('profile.level', { level })}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-white/20 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">{level}</p>
                <p className="text-xs text-white/80">{t('profile.levelLabel')}</p>
              </div>
              <div className="mt-3">
                <div className="w-32 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }} />
                </div>
                <p className="text-xs text-white/80 mt-1">{t('profile.xpProgress', { current: xpInLevel, total: XP_PER_LEVEL })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['overview', 'badges', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap"
              style={{
                backgroundColor: activeTab === tab ? 'var(--primary)' : 'var(--surface)',
                color: activeTab === tab ? 'white' : 'var(--text-primary)',
                border: `1px solid ${activeTab === tab ? 'var(--primary)' : 'var(--border-light)'}`,
              }}
            >
              {t(`profile.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: '📚', value: stats.totalCards, label: t('profile.totalCards') },
                { emoji: '✅', value: stats.cardsReviewed, label: t('profile.reviewed') },
                { emoji: '🎯', value: `${stats.accuracy}%`, label: t('profile.accuracy') },
                { emoji: '⏱️', value: stats.totalStudyTime, label: t('profile.studyTime') },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="inline w-5 h-5 mr-2" style={{ color: 'var(--primary)' }} />
                {t('profile.weeklyProgress')}
              </h3>
              <div className="flex items-end justify-between gap-2 h-48">
                {weeklyProgress.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{day.cards || ''}</span>
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${Math.max(4, (day.cards / maxWeeklyCards) * 100)}%`,
                        backgroundColor: 'var(--primary)',
                        minHeight: '4px',
                      }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{day.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('profile.streakCalendar')}</h3>
              <div className="grid grid-cols-10 md:[grid-template-columns:repeat(15,minmax(0,1fr))] lg:[grid-template-columns:repeat(18,minmax(0,1fr))] gap-1">
                {streakCalendar.map(({ day, intensity, cardsThatDay }) => (
                  <div
                    key={day.toISOString()}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: getIntensityColor(intensity) }}
                    title={t('profile.tooltipCardsStudied', { date: format(day, 'MMM d', { locale: dateLocale }), count: cardsThatDay })}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>{t('profile.less')}</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: getIntensityColor(i) }} />
                  ))}
                </div>
                <span>{t('profile.more')}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {t('profile.allBadges', { earned: badges.length, total: Object.keys(BADGE_CATALOG).length })}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Object.entries(BADGE_CATALOG).map(([type, catalogEntry]) => {
                const earned = badges.find((b) => b.type === type);
                return (
                  <AchievementBadge
                    key={type}
                    size="lg"
                    badge={{
                      id: type,
                      name: earned?.title ?? t(`badges.${type}.name`),
                      icon: earned?.icon ?? catalogEntry.icon,
                      description: earned?.description ?? t(`badges.${type}.description`),
                      color: earned?.color ?? catalogEntry.color,
                      unlocked: !!earned,
                      date: earned ? format(new Date(earned.earnedAt), 'MMM d, yyyy', { locale: dateLocale }) : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('profile.detailedStatistics')}</h3>
              <div className="space-y-4">
                {[
                  { label: t('profile.currentStreak'), value: `🔥 ${stats.streak} ${t('common.days')}`, color: 'var(--primary)' },
                  { label: t('profile.totalCardsStudied'), value: stats.totalCards, color: 'var(--text-primary)' },
                  { label: t('profile.cardsReviewed'), value: stats.cardsReviewed, color: 'var(--text-primary)' },
                  { label: t('profile.overallAccuracy'), value: `${stats.accuracy}%`, color: 'var(--success)' },
                  { label: t('profile.totalStudyTime'), value: stats.totalStudyTime, color: 'var(--text-primary)' },
                ].map((row, index) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between py-3 ${index < 4 ? 'border-b' : ''}`}
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span className="font-bold text-xl" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('profile.recentSessions')}</h3>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{session.deck?.name ?? t('common.deckFallback')}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{format(new Date(session.createdAt), 'MMM d, yyyy', { locale: dateLocale })}</p>
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--success)' }}>
                        {t('profile.correctCount', { correct: session.correctAnswers, total: session.cardsReviewed })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>{t('profile.noSessionsYet')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
