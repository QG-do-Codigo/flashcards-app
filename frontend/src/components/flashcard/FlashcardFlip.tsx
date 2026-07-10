import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Card } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface FlashcardFlipProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardFlip({ card, isFlipped, onFlip }: FlashcardFlipProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (isPlaying) return;
    setIsPlaying(true);

    if (card.audioUrl) {
      const audio = new Audio(card.audioUrl);
      audio.play().catch(() => undefined);
      audio.onended = () => setIsPlaying(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(card.front);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 600);
    }
  };

  return (
    <div style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full h-[400px] cursor-pointer"
        onClick={onFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center"
          style={{
            backgroundColor: theme === 'dark' ? 'var(--surface)' : '#FFFFFF',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-xl)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <div className="text-center space-y-6 w-full">
            <div className="flex justify-center mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}
                disabled={isPlaying}
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {card.front}
            </h2>

            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <RotateCcw className="w-4 h-4" />
              <span>{t('study.clickToReveal')}</span>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center"
          style={{
            backgroundColor: theme === 'dark' ? 'var(--primary)' : '#4F46E5',
            color: 'white',
            boxShadow: 'var(--shadow-xl)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-center space-y-6 w-full">
            <h2 className="text-4xl md:text-5xl font-bold">{card.back}</h2>

            {card.example && (
              <div className="mt-6 p-4 rounded-xl text-left" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
                <p className="text-xs uppercase tracking-wide mb-2 opacity-80">{t('study.example')}</p>
                <p className="text-lg italic">{card.example}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm opacity-80">
              <RotateCcw className="w-4 h-4" />
              <span>{t('study.clickToFlipBack')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
