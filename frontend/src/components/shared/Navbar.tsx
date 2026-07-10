import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Menu, X, User, LogOut, BookOpen } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const streak = user?.streak ?? 0;

  const handleProfileClick = () => {
    setMobileMenuOpen(false);
    navigate('/profile');
  };

  const handleDecksClick = () => {
    setMobileMenuOpen(false);
    navigate('/decks');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)]">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h1 className="font-bold" style={{ color: 'var(--text-primary)' }}>{t('common.appName')}</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('common.tagline')}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {streak > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)' }}
              >
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('navbar.streak')}</p>
                  <p className="font-semibold" style={{ color: 'var(--primary)' }}>{streak} {t('common.days')}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleDecksClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{t('navbar.myDecks')}</span>
            </button>

            <button
              className="relative p-2 rounded-lg transition-all"
              style={{ backgroundColor: 'var(--surface)' }}
              aria-label={t('navbar.notifications')}
            >
              <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--error)' }} />
            </button>

            <LanguageSwitcher />

            <ThemeToggle />

            <button
              onClick={handleProfileClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-80 transition-all"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)' }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary-blue)] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name ?? t('common.profileFallback')}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg transition-all"
              style={{ backgroundColor: 'var(--surface)' }}
              aria-label={t('navbar.logOut')}
              title={t('navbar.logOut')}
            >
              <LogOut className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ backgroundColor: 'var(--surface)' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-light)' }}>
          <div className="px-4 py-4 space-y-4">
            {streak > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-light)' }}
              >
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('navbar.streak')}</p>
                  <p className="font-semibold" style={{ color: 'var(--primary)' }}>{streak} {t('common.days')}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>{t('navbar.darkMode')}</span>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }}>{t('common.language')}</span>
              <LanguageSwitcher />
            </div>

            <button
              onClick={handleDecksClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-light)' }}
            >
              <BookOpen className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('navbar.myDecks')}</span>
            </button>

            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-light)' }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary-blue)] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('navbar.viewProfile')}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-light)' }}
            >
              <LogOut className="w-5 h-5" style={{ color: 'var(--error)' }} />
              <span className="font-medium" style={{ color: 'var(--error)' }}>{t('navbar.logOut')}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
