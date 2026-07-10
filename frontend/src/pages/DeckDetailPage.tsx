import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Pencil, Trash2, Volume2, GripVertical, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { decksApi } from '../api/decks';
import { cardsApi } from '../api/cards';
import type { Card, Deck } from '../types';

export function DeckDetailPage() {
  const { t } = useTranslation();
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<(Deck & { cards: Card[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadDeck = async () => {
    if (!deckId) return;
    const data = await decksApi.getOne(deckId);
    setDeck(data);
  };

  useEffect(() => {
    loadDeck()
      .catch(() => {
        toast.error(t('deckDetail.toastLoadFailed'));
        navigate('/decks');
      })
      .finally(() => setIsLoading(false));
  }, [deckId]);

  const handleDeleteCard = async (card: Card) => {
    if (deleteConfirm !== card.id) {
      setDeleteConfirm(card.id);
      setTimeout(() => setDeleteConfirm((current) => (current === card.id ? null : current)), 3000);
      return;
    }
    try {
      await cardsApi.remove(card.id);
      toast.success(t('deckDetail.toastCardDeleted'));
      setDeleteConfirm(null);
      await loadDeck();
    } catch {
      toast.error(t('deckDetail.toastCardDeleteFailed'));
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!deck) return null;

  const filteredCards = deck.cards.filter(
    (c) => c.front.toLowerCase().includes(searchQuery.toLowerCase()) || c.back.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/decks')}
          className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.backToDecks')}
        </button>

        <div
          className="rounded-2xl p-6 mb-6 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: `linear-gradient(135deg, ${deck.color}, ${deck.color}99)` }}
        >
          <div>
            <h2 className="text-2xl font-bold text-white">{deck.name}</h2>
            <p className="text-white/70 text-sm mt-0.5">{t('deckDetail.cardCount', { count: deck.cards.length })}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/study/${deck.id}`)}
              disabled={deck.cards.length === 0}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)' }}
            >
              {t('deckDetail.study')}
            </button>
            <button
              onClick={() => navigate(`/decks/${deck.id}/cards/new`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'white', color: deck.color }}
            >
              <Plus className="w-4 h-4" /> {t('deckDetail.addCard')}
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder={t('deckDetail.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border-light)', color: 'var(--text-primary)' }}
          />
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{deck.cards.length === 0 ? '🃏' : '🔍'}</div>
            <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              {deck.cards.length === 0 ? t('deckDetail.noCardsYet') : t('deckDetail.noCardsMatch')}
            </p>
            <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-secondary)' }}>
              {deck.cards.length === 0 ? t('deckDetail.addFirstCardHint') : t('deckDetail.tryDifferentSearch')}
            </p>
            {deck.cards.length === 0 && (
              <button
                onClick={() => navigate(`/decks/${deck.id}/cards/new`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
                style={{ background: 'var(--primary)' }}
              >
                <Plus className="w-4 h-4" /> {t('deckDetail.addFirstCard')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl p-4 flex items-start gap-4 group"
                style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border-light)' }}
              >
                <GripVertical className="w-4 h-4 mt-0.5 opacity-30 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex gap-4 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{t('common.front')}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{card.front}</p>
                        {card.audioUrl && <Volume2 className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />}
                      </div>
                    </div>
                    <div className="w-px self-stretch" style={{ backgroundColor: 'var(--border-light)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{t('common.back_label')}</p>
                      <p className="font-semibold text-sm truncate" style={{ color: deck.color }}>{card.back}</p>
                    </div>
                  </div>
                  {card.example && (
                    <p className="text-xs mt-1.5 italic" style={{ color: 'var(--text-secondary)' }}>"{card.example}"</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => navigate(`/decks/${deck.id}/cards/${card.id}/edit`)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    title={t('deckDetail.editCard')}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: deleteConfirm === card.id ? 'var(--error)' : 'var(--text-secondary)' }}
                    title={deleteConfirm === card.id ? t('deckDetail.clickAgainConfirmDelete') : t('deckDetail.deleteCard')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
