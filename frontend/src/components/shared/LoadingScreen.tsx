import { useTranslation } from 'react-i18next';

export function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="text-6xl animate-bounce">📚</div>
      <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
        {t('common.loading')}
      </p>
    </div>
  );
}
