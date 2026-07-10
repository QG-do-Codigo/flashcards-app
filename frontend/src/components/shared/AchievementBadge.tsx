export interface AchievementBadgeData {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  unlocked: boolean;
  date?: string;
}

interface AchievementBadgeProps {
  badge: AchievementBadgeData;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'w-12 h-12 text-2xl', md: 'w-16 h-16 text-3xl', lg: 'w-20 h-20 text-4xl' };
const containerSize = { sm: 'p-3', md: 'p-4', lg: 'p-6' };

export function AchievementBadge({ badge, size = 'md' }: AchievementBadgeProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${containerSize[size]} rounded-2xl transition-all cursor-pointer hover:scale-105`}
      style={{
        backgroundColor: badge.unlocked ? 'var(--surface)' : 'var(--muted)',
        border: `2px solid ${badge.unlocked ? badge.color : 'var(--border-light)'}`,
        opacity: badge.unlocked ? 1 : 0.5,
        boxShadow: badge.unlocked ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      }}
      title={badge.description}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
        style={{ backgroundColor: badge.unlocked ? `${badge.color}20` : 'var(--muted)' }}
      >
        <span className={badge.unlocked ? '' : 'grayscale'}>{badge.icon}</span>
      </div>
      {size !== 'sm' && (
        <>
          <span className="text-sm font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
            {badge.name}
          </span>
          {badge.unlocked && badge.date && (
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {badge.date}
            </span>
          )}
        </>
      )}
    </div>
  );
}

export const BADGE_CATALOG: Record<string, { icon: string; color: string }> = {
  FIRST_DECK: { icon: '🎯', color: '#4F46E5' },
  STREAK_7: { icon: '🔥', color: '#EF4444' },
  STREAK_30: { icon: '🌟', color: '#F59E0B' },
  STREAK_100: { icon: '💎', color: '#06B6D4' },
  FAST_LEARNER: { icon: '⚡', color: '#FBBF24' },
  DECK_MASTER: { icon: '🏆', color: '#10B981' },
  PERFECT_SESSION: { icon: '💯', color: '#8B5CF6' },
  MARATHON: { icon: '🎖️', color: '#3B82F6' },
};
