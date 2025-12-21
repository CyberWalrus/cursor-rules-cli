import { detectLanguage } from './detect-language';
import type { Translations } from './get-translations';
import { getTranslations } from './get-translations';

let currentLanguage: 'en' | 'ru' | null = null;
let translations: Record<keyof Translations, string> | null = null;

/** Выполняет подстановку параметров в строку */
function interpolate(template: string, params?: Record<string, string>): string {
    if (params === null || params === undefined) {
        return template;
    }

    let result = template;

    for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    return result;
}

/** Инициализирует систему локализации */
export async function initI18n(): Promise<void> {
    currentLanguage = await detectLanguage();
    translations = getTranslations(currentLanguage);
}

/** Получает перевод для указанного ключа с подстановкой параметров */
export function t(key: keyof Translations, params?: Record<string, string>): string {
    if (translations === null) {
        const defaultTranslations = getTranslations('en');
        const translation = defaultTranslations[key];

        return interpolate(translation !== undefined ? translation : String(key), params);
    }

    const translation = translations[key];

    return interpolate(translation !== undefined ? translation : String(key), params);
}

/** Сбрасывает состояние локализации (только для тестов) */
export function resetI18n(): void {
    currentLanguage = null;
    translations = null;
}
