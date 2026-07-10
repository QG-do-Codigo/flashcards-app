import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { decksApi } from '../api/decks';
import { cardsApi } from '../api/cards';
import type { Deck } from '../types';

export function CardFormPage() {
  const { t } = useTranslation();
  const { deckId, cardId } = useParams<{ deckId: string; cardId?: string }>();
  const navigate = useNavigate();
  const isEdit = !!cardId;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [example, setExample] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!deckId) return;
    let cancelled = false;

    (async () => {
      try {
        const [deckData, cardData] = await Promise.all([decksApi.getOne(deckId), cardId ? cardsApi.getOne(cardId) : null]);
        if (cancelled) return;
        setDeck(deckData);
        if (cardData) {
          setFront(cardData.front);
          setBack(cardData.back);
          setExample(cardData.example ?? '');
          setAudioUrl(cardData.audioUrl ?? '');
        }
      } catch {
        toast.error(t('cardForm.toastLoadFailed'));
        navigate('/decks');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deckId, cardId]);

  if (isLoading) return <LoadingScreen />;
  if (!deck) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: { front?: string; back?: string } = {};
    if (!front.trim()) nextErrors.front = t('cardForm.frontRequired');
    if (!back.trim()) nextErrors.back = t('cardForm.backRequired');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      front: front.trim(),
      back: back.trim(),
      example: example.trim() || undefined,
      audioUrl: audioUrl.trim() || undefined,
    };

    setIsSaving(true);
    try {
      if (isEdit && cardId) {
        await cardsApi.update(cardId, payload);
        toast.success(t('cardForm.toastUpdated'));
      } else {
        await cardsApi.create(deck.id, payload);
        toast.success(t('cardForm.toastAdded'));
      }
      navigate(`/decks/${deck.id}`);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : message || t('cardForm.toastSaveFailed'));
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate(`/decks/${deck.id}`)}
          className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" /> {t('cardForm.backTo', { deckName: deck.name })}
        </button>

        <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border-light)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${deck.color}20` }}>
              <span className="text-lg">{isEdit ? '✏️' : '🃏'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{isEdit ? t('cardForm.editTitle') : t('cardForm.newTitle')}</h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{deck.name}</p>
            </div>
          </div>

          <div className="rounded-xl mb-6 overflow-hidden" style={{ border: `1.5px dashed ${deck.color}60` }}>
            <div className="p-4 flex items-center justify-between gap-3" style={{ backgroundColor: `${deck.color}08` }}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('common.front')}</p>
                <p className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                  {front || <span style={{ opacity: 0.35 }}>{t('cardForm.frontSidePlaceholder')}</span>}
                </p>
              </div>
              <div className="px-3 text-xl shrink-0" style={{ color: deck.color }}>⟷</div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('common.back_label')}</p>
                <p className="font-bold text-base truncate" style={{ color: deck.color }}>
                  {back || <span style={{ opacity: 0.35 }}>{t('cardForm.backSidePlaceholder')}</span>}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('cardForm.front')} <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder={t('cardForm.frontPlaceholder')}
                value={front}
                onChange={(e) => {
                  setFront(e.target.value);
                  setErrors((prev) => ({ ...prev, front: undefined }));
                }}
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--background)',
                  border: `1.5px solid ${errors.front ? 'var(--error)' : 'var(--border-light)'}`,
                  color: 'var(--text-primary)',
                }}
              />
              {errors.front && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.front}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('cardForm.back')} <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder={t('cardForm.backPlaceholder')}
                value={back}
                onChange={(e) => {
                  setBack(e.target.value);
                  setErrors((prev) => ({ ...prev, back: undefined }));
                }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--background)',
                  border: `1.5px solid ${errors.back ? 'var(--error)' : 'var(--border-light)'}`,
                  color: 'var(--text-primary)',
                }}
              />
              {errors.back && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.back}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('cardForm.exampleSentence')} <span className="text-xs font-normal opacity-60">{t('cardForm.optional')}</span>
              </label>
              <textarea
                placeholder={t('cardForm.examplePlaceholder')}
                value={example}
                onChange={(e) => setExample(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                style={{ backgroundColor: 'var(--background)', border: '1.5px solid var(--border-light)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('cardForm.audioUrl')} <span className="text-xs font-normal opacity-60">{t('cardForm.optional')}</span>
              </label>
              <input
                type="url"
                placeholder={t('cardForm.audioUrlPlaceholder')}
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--background)', border: '1.5px solid var(--border-light)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(`/decks/${deck.id}`)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-70"
                style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)', border: '1.5px solid var(--border-light)' }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 12px rgba(79,70,229,0.35)' }}
              >
                <Check className="w-4 h-4" />
                {isSaving ? t('common.saving') : isEdit ? t('common.saveChanges') : t('cardForm.addCard')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
