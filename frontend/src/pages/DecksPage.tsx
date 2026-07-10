import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Search, BookOpen, Trash2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { decksApi } from '../api/decks';
import type { Deck } from '../types';

export function DecksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    decksApi
      .getAll()
      .then(setDecks)
      .catch(() => toast.error(t('decksPage.toastLoadFailed')));
  }, []);

  if (decks === null) return <LoadingScreen />;

  const totalCards = decks.reduce((sum, d) => sum + d._count.cards, 0);
  const filteredDecks = decks.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDeleteDeck = async (deckId: string) => {
    if (deleteConfirm !== deckId) {
      setDeleteConfirm(deckId);
      setTimeout(() => setDeleteConfirm((current) => (current === deckId ? null : current)), 3000);
      return;
    }
    const deck = decks.find((d) => d.id === deckId);
    try {
      await decksApi.remove(deckId);
      setDecks((prev) => prev?.filter((d) => d.id !== deckId) ?? null);
      setDeleteConfirm(null);
      toast.success(t('decksPage.toastDeckDeleted', { name: deck?.name }));
    } catch {
      toast.error(t('decksPage.toastDeleteFailed'));
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm mb-3 transition-colors hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" /> {t('common.backToDashboard')}
            </button>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('decksPage.title')}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {t('decksPage.deckCount', { count: decks.length })} · {t('decksPage.cardCountTotal', { count: totalCards })}
            </p>
          </div>
          <button
            onClick={() => navigate('/decks/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', boxShadow: 'var(--shadow-md)' }}
          >
            <Plus className="w-4 h-4" /> {t('decksPage.newDeck')}
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder={t('decksPage.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border-light)', color: 'var(--text-primary)' }}
          />
        </div>

        {filteredDecks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{t('decksPage.noDecksFound')}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery ? t('decksPage.tryDifferentSearch') : t('decksPage.createFirstDeckPrompt')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => navigate(`/decks/${deck.id}`)}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="h-1.5" style={{ backgroundColor: deck.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${deck.color}20` }}>
                      <BookOpen className="w-5 h-5" style={{ color: deck.color }} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: deleteConfirm === deck.id ? 'var(--error)' : 'var(--text-secondary)' }}
                      title={deleteConfirm === deck.id ? t('decksPage.clickAgainConfirm') : t('decksPage.deleteDeck')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{deck.name}</h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {t('decksPage.cardCountShort', { count: deck._count.cards })}
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/study/${deck.id}`);
                      }}
                      disabled={deck._count.cards === 0}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: `${deck.color}18`, color: deck.color }}
                    >
                      {t('deckCard.studyNow')}
                    </button>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
