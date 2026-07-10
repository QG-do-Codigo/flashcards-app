import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Edit, Trash2, MoreVertical, BookOpen } from 'lucide-react';

export interface DeckViewModel {
  id: string;
  name: string;
  color: string;
  totalCards: number;
  toReview: number;
  lastStudied?: string;
  progress: number;
}

interface DeckCardProps {
  deck: DeckViewModel;
  onStudy: (deckId: string) => void;
  onManage: (deckId: string) => void;
  onEdit: (deckId: string) => void;
  onDelete: (deckId: string) => void;
}

export function DeckCard({ deck, onStudy, onManage, onEdit, onDelete }: DeckCardProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="relative rounded-2xl p-6 transition-all hover:scale-[1.02] group"
      style={{ backgroundColor: 'var(--surface)', border: `2px solid ${deck.color}40`, boxShadow: 'var(--shadow-md)' }}
    >
      <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl" style={{ backgroundColor: deck.color }} />

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="absolute top-0 right-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <MoreVertical className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>

        {showMenu && (
          <div
            className="absolute top-10 right-0 rounded-xl p-2 z-10 min-w-[150px]"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}
          >
            <button
              onClick={() => {
                onEdit(deck.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <Edit className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('deckCard.edit')}</span>
            </button>
            <button
              onClick={() => {
                onManage(deck.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all mt-1"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('deckCard.manageCards')}</span>
            </button>
            <button
              onClick={() => {
                onDelete(deck.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all mt-1"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <Trash2 className="w-4 h-4" style={{ color: 'var(--error)' }} />
              <span className="text-sm" style={{ color: 'var(--error)' }}>{t('deckCard.delete')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={() => onManage(deck.id)}
          className="text-xl font-bold mb-3 text-left hover:underline"
          style={{ color: 'var(--text-primary)' }}
        >
          {deck.name}
        </button>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('deckCard.totalCards')}</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{deck.totalCards}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('deckCard.toReview')}</span>
            <span className="font-semibold" style={{ color: deck.color }}>{deck.toReview}</span>
          </div>
          {deck.lastStudied && (
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('deckCard.lastStudied')}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{deck.lastStudied}</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('deckCard.progress')}</span>
            <span className="text-xs font-semibold" style={{ color: deck.color }}>{deck.progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${deck.progress}%`, backgroundColor: deck.color }}
            />
          </div>
        </div>

        <button
          onClick={() => onStudy(deck.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: deck.color, boxShadow: 'var(--shadow-md)' }}
        >
          <Play className="w-5 h-5" fill="white" />
          <span>{t('deckCard.studyNow')}</span>
        </button>
      </div>
    </div>
  );
}
