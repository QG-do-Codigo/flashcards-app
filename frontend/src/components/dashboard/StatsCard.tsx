import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon?: LucideIcon;
  iconEmoji?: string;
  label: string;
  value: string | number;
  color: string;
}

export function StatsCard({ icon: Icon, iconEmoji, label, value, color }: StatsCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-[1.02]"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ backgroundColor: color }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            {iconEmoji ? (
              <span className="text-2xl">{iconEmoji}</span>
            ) : Icon ? (
              <Icon className="w-6 h-6" style={{ color }} />
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
      </div>
    </div>
  );
}
