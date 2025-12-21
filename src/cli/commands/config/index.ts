import { cancel, isCancel, select } from '@clack/prompts';

import { t } from '../../../lib/i18n';
import { readUserConfig, writeUserConfig } from '../../../lib/user-config';
import type { UserConfig } from '../../../model';

/** Команда настройки глобальной конфигурации */
export async function configCommand(): Promise<void> {
    const currentConfig = await readUserConfig();
    const currentLanguage = currentConfig?.language ?? 'en';

    const language = await select<'en' | 'ru'>({
        initialValue: currentLanguage,
        message: t('command.config.select-language'),
        options: [
            { label: t('command.config.language.en'), value: 'en' },
            { label: t('command.config.language.ru'), value: 'ru' },
        ],
    });

    if (isCancel(language)) {
        cancel(t('cli.interactive-menu.cancelled'));

        return;
    }

    const config: UserConfig = {
        ...currentConfig,
        language,
    };

    await writeUserConfig(config);
    console.log(t('command.config.success', { language }));
}
