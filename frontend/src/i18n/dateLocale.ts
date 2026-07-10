import { enUS, es, ptBR } from 'date-fns/locale';
import type { Locale } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  es,
  'pt-BR': ptBR,
};

export function useDateLocale() {
  const { i18n } = useTranslation();
  return DATE_FNS_LOCALES[i18n.resolvedLanguage ?? 'en'] ?? enUS;
}
