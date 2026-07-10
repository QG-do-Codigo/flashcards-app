import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { X, BookOpen } from 'lucide-react';
import type { Deck } from '../../types';

const COLOR_OPTIONS = ['#4F46E5', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6'];

interface EditDeckModalProps {
  deck: Deck;
  onClose: () => void;
  onSave: (payload: { name: string; description?: string; color: string }) => Promise<void>;
}

export function EditDeckModal({ deck, onClose, onSave }: EditDeckModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description ?? '');
  const [color, setColor] = useState(deck.color);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return;
    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() || undefined, color });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('editDeckModal.title')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
            <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{t('editDeckModal.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={3}
              required
              className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{t('editDeckModal.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all resize-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{t('editDeckModal.color')}</label>
            <div className="flex gap-2.5 flex-wrap">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  className="w-9 h-9 rounded-xl transition-all hover:scale-110"
                  style={{
                    backgroundColor: option,
                    outline: color === option ? `3px solid ${option}` : 'none',
                    outlineOffset: '2px',
                    boxShadow: color === option ? `0 0 0 2px white, 0 0 0 4px ${option}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ backgroundColor: 'var(--background)', border: '1.5px dashed var(--border-light)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <BookOpen className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{name || t('createDeckPage.previewName')}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('editDeckModal.cardCount', { count: deck._count.cards })}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', boxShadow: 'var(--shadow-md)' }}
          >
            {isSaving ? t('common.saving') : t('common.saveChanges')}
          </button>
        </form>
      </div>
    </div>
  );
}
