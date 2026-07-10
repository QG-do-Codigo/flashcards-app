import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success(t('login.toastWelcomeBack'));
      } else {
        await register(name, email, password);
        toast.success(t('login.toastAccountCreated'));
      }
      navigate('/');
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : message || t('login.toastGenericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: 'var(--primary)' }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: 'var(--secondary-blue)' }} />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        <div className="hidden lg:flex flex-col items-center justify-center p-12">
          <div className="relative">
            <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary-blue)] opacity-20 blur-3xl absolute" />
            <div className="relative z-10 text-center space-y-6">
              <div className="text-9xl mb-6">📚</div>
              <h2 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('login.heroTitleLine1')}
                <br />
                <span style={{ color: 'var(--primary)' }}>{t('login.heroTitleLine2')}</span>
              </h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                {t('login.heroSubtitle')}
              </p>
              <div className="flex items-center justify-center gap-8 pt-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('login.dailyStreaks')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('login.smartLearning')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('login.achievements')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="rounded-3xl p-8 sm:p-12" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)' }}>
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('common.appName')}</h1>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {isLogin ? t('login.welcomeBack') : t('login.getStarted')}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {isLogin ? t('login.signInSubtitle') : t('login.signUpSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder={t('login.fullNamePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={2}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all outline-none"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', boxShadow: 'var(--shadow-lg)' }}
              >
                {isSubmitting ? t('login.pleaseWait') : isLogin ? t('login.signIn') : t('login.createAccount')}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p style={{ color: 'var(--text-secondary)' }}>
                {isLogin ? t('login.noAccount') : t('login.hasAccount')}
                <button onClick={() => setIsLogin(!isLogin)} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                  {isLogin ? t('login.signUp') : t('login.signIn')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
