import { cancel, isCancel, log, select } from '@clack/prompts';
import { fileURLToPath } from 'node:url';

import { copyToClipboard } from '../../../lib/clipboard';
import { t } from '../../../lib/i18n';
import {
    generateCurrentDatePrompt,
    generateMcpConfig,
    generateMetaInfoPrompt,
    getCoreSystemInstructions,
} from '../../../lib/prompts';
import { fillMissingMetaInfo, readUserConfig, validateMetaInfo, writeUserConfig } from '../../../lib/user-config';
import { getPackageDir } from '../../main/get-package-dir';

const currentFilePath = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);

/** Тип системного файла для копирования */
type SystemFileType = 'core-instructions' | 'current-date' | 'mcp-config' | 'meta-info';

/** Команда работы с системными файлами */
export async function systemFilesCommand(): Promise<void> {
    const packageDir = getPackageDir(currentFilePath);
    if (packageDir === null || packageDir === undefined) {
        throw new Error(t('cli.main.package-dir-not-found'));
    }

    const fileType = await select<SystemFileType>({
        message: t('command.system-files.select-type'),
        options: [
            {
                hint: t('command.system-files.core-instructions.hint'),
                label: t('command.system-files.core-instructions'),
                value: 'core-instructions',
            },
            {
                hint: t('command.system-files.meta-info.hint'),
                label: t('command.system-files.meta-info'),
                value: 'meta-info',
            },
            {
                hint: t('command.system-files.current-date.hint'),
                label: t('command.system-files.current-date'),
                value: 'current-date',
            },
            {
                hint: t('command.system-files.mcp-config.hint'),
                label: t('command.system-files.mcp-config'),
                value: 'mcp-config',
            },
        ],
    });

    if (isCancel(fileType)) {
        cancel(t('cli.interactive-menu.cancelled'));

        return;
    }

    try {
        let content: string;

        switch (fileType) {
            case 'core-instructions':
                content = await getCoreSystemInstructions(packageDir);
                break;
            case 'meta-info': {
                let userConfig = await readUserConfig();
                const validation = validateMetaInfo(userConfig?.metaInfo);

                if (!validation.isValid) {
                    log.info(t('command.system-files.meta-info.missing-fields'));

                    const filledMetaInfo = await fillMissingMetaInfo(userConfig?.metaInfo, validation.missingFields);

                    if (filledMetaInfo === null) {
                        cancel(t('cli.interactive-menu.cancelled'));

                        return;
                    }

                    userConfig = {
                        language: userConfig?.language ?? 'en',
                        ...userConfig,
                        metaInfo: filledMetaInfo,
                    };

                    await writeUserConfig(userConfig);
                }

                content = await generateMetaInfoPrompt(packageDir, userConfig?.metaInfo);
                break;
            }
            case 'current-date':
                content = await generateCurrentDatePrompt(packageDir);
                break;
            case 'mcp-config': {
                const userConfig = await readUserConfig();
                content = await generateMcpConfig(packageDir, userConfig?.mcpSettings);
                break;
            }
        }

        await copyToClipboard(content);
        log.success(t('command.system-files.copied'));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(t('command.system-files.error', { message }));
    }
}
