import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { decksApi } from '../api/decks';

const DECK_COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6'];

export function CreateDeckPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [color, setColor] = useState(DECK_COLORS[0]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError(t('createDeckPage.nameTooShort'));
      return;
    }
    setIsSaving(true);
    try {
      const deck = await decksApi.create({ name: name.trim(), color });
      toast.success(t('createDeckPage.toastCreated'));
      navigate(`/decks/${deck.id}`);
    } catch {
      toast.error(t('createDeckPage.toastCreateFailed'));
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/decks')}
          className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.backToDecks')}
        </button>

        <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border-light)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('createDeckPage.title')}</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('createDeckPage.deckName')}</label>
              <input
                type="text"
                placeholder={t('createDeckPage.namePlaceholder')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--background)',
                  border: `1.5px solid ${error ? 'var(--error)' : 'var(--border-light)'}`,
                  color: 'var(--text-primary)',
                }}
              />
              {error && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{error}</p>}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>{t('createDeckPage.color')}</label>
              <div className="flex gap-2.5 flex-wrap">
                {DECK_COLORS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    className="w-9 h-9 rounded-full transition-all hover:scale-110"
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
              className="rounded-xl p-4 mb-8 flex items-center gap-3"
              style={{ backgroundColor: 'var(--background)', border: '1.5px dashed var(--border-light)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <BookOpen className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{name || t('createDeckPage.previewName')}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('createDeckPage.previewCards')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/decks')}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-70"
                style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)', border: '1.5px solid var(--border-light)' }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 12px rgba(79,70,229,0.35)' }}
              >
                {isSaving ? t('createDeckPage.creating') : t('createDeckPage.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
