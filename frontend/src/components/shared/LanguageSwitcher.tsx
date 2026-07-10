import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? SUPPORTED_LANGUAGES[0];

  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:opacity-80"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)' }}
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <span className="text-lg leading-none">{current.flag}</span>
      </button>

      {open && (
        <div
          className="absolute top-12 right-0 rounded-xl p-2 z-10 min-w-[170px]"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: current.code === lang.code ? 'var(--background)' : 'transparent' }}
            >
              <span className="text-lg leading-none">{lang.flag}</span>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
