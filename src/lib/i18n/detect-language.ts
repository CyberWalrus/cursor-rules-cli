import type { UserConfig } from '../../model';
import { readUserConfig } from '../user-config';

/** Определяет язык интерфейса */
export async function detectLanguage(): Promise<'en' | 'ru'> {
    const userConfig: UserConfig | null = await readUserConfig();

    if (userConfig !== null && userConfig.language !== null && userConfig.language !== undefined) {
        return userConfig.language;
    }

    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL;

    if (envLang !== null && envLang !== undefined) {
        const langCode = envLang.split('.')[0]?.split('_')[0]?.toLowerCase();

        if (langCode === 'ru' || langCode === 'en') {
            return langCode;
        }
    }

    try {
        const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
        const langCode = systemLocale.split('-')[0]?.toLowerCase();

        if (langCode === 'ru' || langCode === 'en') {
            return langCode;
        }
    } catch {
        // Ignore errors
    }

    return 'en';
}
