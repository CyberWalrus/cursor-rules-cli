import { cancel, isCancel, select } from '@clack/prompts';

import { t } from '../../../lib/i18n';
import { readUserConfig, writeUserConfig } from '../../../lib/user-config';
import type { UserConfig } from '../../../model';
import { manageUserRulesCommand } from './user-rules';

/** Команда настройки глобальной конфигурации */
export async function configCommand(): Promise<void> {
    const action = await select<'language' | 'user-rules'>({
        message: 'Выберите настройку:',
        options: [
            { label: 'Язык интерфейса', value: 'language' },
            { label: 'User Rules', value: 'user-rules' },
        ],
    });

    if (isCancel(action)) {
        cancel(t('cli.interactive-menu.cancelled'));

        return;
    }

    if (action === 'user-rules') {
        await manageUserRulesCommand();

        return;
    }

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
