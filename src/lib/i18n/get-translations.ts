import { EN_TRANSLATIONS } from './locales/en';
import { RU_TRANSLATIONS } from './locales/ru';

/** Получает объект переводов для указанного языка */
export function getTranslations(language: 'en' | 'ru'): Record<keyof typeof EN_TRANSLATIONS, string> {
    return (language === 'ru' ? RU_TRANSLATIONS : EN_TRANSLATIONS) as Record<keyof typeof EN_TRANSLATIONS, string>;
}
