import { en } from './locales/en';
import { ru } from './locales/ru';

export type Translations = typeof en;

/** Получает объект переводов для указанного языка */
export function getTranslations(language: 'en' | 'ru'): Record<keyof typeof en, string> {
    if (language === 'ru') {
        return ru as Record<keyof typeof en, string>;
    }

    return en as Record<keyof typeof en, string>;
}
