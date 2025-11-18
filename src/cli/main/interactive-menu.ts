import { cancel, intro, isCancel, outro, select } from '@clack/prompts';

import type { InteractiveMenuAction } from '../../model/types/main';
import { initCommand } from '../commands/init';
import { replaceAllCommand } from '../commands/replace-all';
import { upgradeCommand } from '../commands/upgrade';
import { getPackageDir } from './get-package-dir';
import { getTargetDir } from './get-target-dir';

/** Показывает интерактивное меню выбора команды */
export async function showInteractiveMenu(currentFilePath: string): Promise<void> {
    intro('cursor-rules-cli');

    const action = await select<InteractiveMenuAction>({
        message: 'Выберите действие:',
        options: [
            { label: 'Инициализировать правила (init)', value: 'init' },
            { label: 'Обновить правила (upgrade)', value: 'upgrade' },
            { label: 'Заменить все правила (replace-all)', value: 'replace-all' },
            { label: 'Выход', value: 'exit' },
        ],
    });

    if (isCancel(action)) {
        cancel('Операция отменена');
        process.exit(0);
    }

    if (action === 'exit') {
        outro('До свидания! 👋');

        return;
    }

    const packageDir = getPackageDir(currentFilePath);
    if (packageDir === null || packageDir === undefined) {
        throw new Error('Package directory not found');
    }

    const targetDir = getTargetDir();
    if (targetDir === null || targetDir === undefined) {
        throw new Error('Target directory not found');
    }

    try {
        switch (action) {
            case 'init':
                await initCommand(packageDir, targetDir);
                outro('✅ Rules initialized successfully');
                break;
            case 'upgrade':
                await upgradeCommand(packageDir, targetDir);
                outro('✅ Rules upgraded successfully');
                break;
            case 'replace-all':
                await replaceAllCommand(packageDir, targetDir);
                outro('✅ Rules replaced successfully');
                break;
        }
    } catch (error) {
        cancel(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
