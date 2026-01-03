import { cancel, intro, isCancel, outro, select } from '@clack/prompts';

import { t } from '../../lib/i18n';
import { getCurrentVersion } from '../../lib/version-manager/get-current-version';
import type { InteractiveMenuAction } from '../../model/types/main';
import { configCommand } from '../commands/config';
import { initCommand } from '../commands/init';
import { systemFilesCommand } from '../commands/system-files';
import { upgradeCommand } from '../commands/upgrade';
import { versionsCommand } from '../commands/versions';
import { getPackageDir } from './get-package-dir';
import { getTargetDir } from './get-target-dir';

/** Показывает интерактивное меню выбора команды */
export async function showInteractiveMenu(currentFilePath: string): Promise<void> {
    intro(t('cli.interactive-menu.title'));

    const targetDir = getTargetDir();
    if (targetDir === null || targetDir === undefined) {
        throw new Error(t('cli.interactive-menu.target-dir-not-found'));
    }

    const currentVersion = await getCurrentVersion(targetDir);
    const isInitialized = currentVersion !== null;

    const options: Array<{ label: string; value: InteractiveMenuAction; hint?: string }> = [];

    if (!isInitialized) {
        options.push({
            hint: t('cli.interactive-menu.init.hint'),
            label: t('cli.interactive-menu.init'),
            value: 'init',
        });
    }

    if (isInitialized) {
        options.push({
            hint: t('cli.interactive-menu.upgrade.hint'),
            label: t('cli.interactive-menu.upgrade'),
            value: 'upgrade',
        });
    }

    options.push(
        {
            hint: t('cli.interactive-menu.system-files.hint'),
            label: t('cli.interactive-menu.system-files'),
            value: 'system-files',
        },
        { hint: t('cli.interactive-menu.config.hint'), label: t('cli.interactive-menu.config'), value: 'config' },
        { hint: t('cli.interactive-menu.versions.hint'), label: t('cli.interactive-menu.versions'), value: 'versions' },
        { label: t('cli.interactive-menu.exit'), value: 'exit' },
    );

    const action = await select<InteractiveMenuAction>({
        message: t('cli.interactive-menu.select-action'),
        options,
    });

    if (isCancel(action)) {
        cancel(t('cli.interactive-menu.cancelled'));
        process.exit(0);
    }

    if (action === 'exit') {
        outro(t('cli.interactive-menu.goodbye'));

        return;
    }

    const packageDir = getPackageDir(currentFilePath);
    if (packageDir === null || packageDir === undefined) {
        throw new Error(t('cli.main.package-dir-not-found'));
    }

    try {
        switch (action) {
            case 'init':
                await initCommand(packageDir, targetDir);
                outro(t('cli.main.init.success'));
                break;
            case 'upgrade':
                await upgradeCommand(packageDir, targetDir);
                outro(t('cli.main.upgrade.success'));
                break;
            case 'config':
                await configCommand();
                outro(t('cli.main.config.success'));
                break;
            case 'system-files':
                await systemFilesCommand();
                break;
            case 'versions':
                await versionsCommand();
                break;
        }
    } catch (error) {
        cancel(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
