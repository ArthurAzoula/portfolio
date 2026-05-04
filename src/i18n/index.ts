import fr from './fr.json';
import en from './en.json';
import type { Translations } from './types';

export type { Translations } from './types';
export type Locale = 'fr' | 'en';

const translations: Record<Locale, Translations> = { fr, en };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en') return 'en';
  return 'fr';
}

export function getLocalizedPath(path: string, locale: Locale): string {
  const cleanPath = path.replace(/^\/(en|fr)/, '') || '/';
  if (locale === 'fr') return cleanPath;
  return `/en${cleanPath}`;
}
