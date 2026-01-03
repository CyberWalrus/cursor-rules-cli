import { cancel, isCancel, log, outro, select } from '@clack/prompts';

import { copyToClipboard } from '../../../lib/clipboard';
import { getLatestSystemRulesVersion } from '../../../lib/github-fetcher/get-latest-system-rules-version';
import { t } from '../../../lib/i18n';
import {
    generateCurrentDatePrompt,
    generateMcpConfig,
    generateMetaInfoPrompt,
    getCoreSystemInstructions,
    removeYamlFrontmatter,
} from '../../../lib/prompts';
import {
    fillMissingMcpSettings,
    fillMissingMetaInfo,
    readUserConfig,
    validateMcpSettings,
    validateMetaInfo,
    writeUserConfig,
} from '../../../lib/user-config';
import { GITHUB_REPO } from '../../../model';
import { COPY_MESSAGES } from './constants';
import type { SystemFileMenuAction, SystemFilesCommandResult, SystemFileType } from './types';

/** Проверяет доступность GitHub и устанавливает флаг ошибки */
async function checkGithubAvailability(): Promise<boolean> {
    try {
        const latestVersion = await getLatestSystemRulesVersion(GITHUB_REPO);

        return latestVersion === null;
    } catch {
        return true;
    }
}

/** Обрабатывает выбор действия меню */
function handleMenuAction(menuAction: SystemFileMenuAction | symbol): SystemFilesCommandResult | null {
    if (isCancel(menuAction)) {
        cancel(t('cli.interactive-menu.cancelled'));

        return 'back-to-menu';
    }

    if (menuAction === 'back-to-menu') {
        return 'back-to-menu';
    }

    if (menuAction === 'finish') {
        outro(t('cli.interactive-menu.goodbye'));

        return 'finish';
    }

    return null;
}

/** Получает контент для core-instructions */
async function getCoreInstructionsContent(isGithubError: boolean): Promise<string> {
    const rawContent = await getCoreSystemInstructions(isGithubError);

    return removeYamlFrontmatter(rawContent);
}

/** Получает контент для meta-info */
async function getMetaInfoContent(isGithubError: boolean): Promise<string> {
    let userConfig = await readUserConfig();
    const validation = validateMetaInfo(userConfig?.metaInfo);

    if (!validation.isValid) {
        log.info(t('command.system-files.meta-info.missing-fields'));

        const filledMetaInfo = await fillMissingMetaInfo(userConfig?.metaInfo, validation.missingFields);

        if (filledMetaInfo === null) {
            cancel(t('cli.interactive-menu.cancelled'));

            throw new Error('cancelled');
        }

        userConfig = {
            ...userConfig,
            language: userConfig?.language ?? 'en',
            metaInfo: filledMetaInfo,
        };

        await writeUserConfig(userConfig);
    }

    const rawContent = await generateMetaInfoPrompt(userConfig?.metaInfo, isGithubError);

    return removeYamlFrontmatter(rawContent);
}

/** Получает контент для current-date */
async function getCurrentDateContent(isGithubError: boolean): Promise<string> {
    const rawContent = await generateCurrentDatePrompt(isGithubError);

    return removeYamlFrontmatter(rawContent);
}

/** Получает контент для mcp-config */
async function getMcpConfigContent(isGithubError: boolean): Promise<string> {
    let userConfig = await readUserConfig();
    const validation = validateMcpSettings(userConfig?.mcpSettings);

    if (!validation.isValid) {
        log.info(t('command.system-files.mcp-config.missing-fields'));

        const filledMcpSettings = await fillMissingMcpSettings(userConfig?.mcpSettings, validation.missingFields);

        if (filledMcpSettings === null) {
            cancel(t('cli.interactive-menu.cancelled'));

            throw new Error('cancelled');
        }

        userConfig = {
            ...userConfig,
            language: userConfig?.language ?? 'en',
            mcpSettings: filledMcpSettings,
        };

        await writeUserConfig(userConfig);
    }

    return generateMcpConfig(userConfig?.mcpSettings, isGithubError);
}

/** Получает контент файла по типу */
async function getFileContent(
    fileType: Exclude<SystemFileMenuAction, 'back-to-menu' | 'finish'>,
    isGithubError: boolean,
): Promise<string> {
    switch (fileType) {
        case 'core-instructions':
            return getCoreInstructionsContent(isGithubError);
        case 'meta-info':
            return getMetaInfoContent(isGithubError);
        case 'current-date':
            return getCurrentDateContent(isGithubError);
        case 'mcp-config':
            return getMcpConfigContent(isGithubError);
    }
}

/** Выполняет команду работы с системными файлами */
export async function systemFilesCommand(): Promise<SystemFilesCommandResult> {
    const isGithubError = await checkGithubAvailability();

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const menuAction = await select<SystemFileMenuAction>({
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
                { label: t('command.system-files.back-to-menu'), value: 'back-to-menu' },
                { label: t('command.system-files.finish'), value: 'finish' },
            ],
        });

        const actionResult = handleMenuAction(menuAction);

        if (actionResult !== null) {
            return actionResult;
        }

        const fileType = menuAction as SystemFileType;

        try {
            const content = await getFileContent(fileType, isGithubError);

            await copyToClipboard(content);
            log.success(COPY_MESSAGES[fileType]);
        } catch (error) {
            if (error instanceof Error && error.message === 'cancelled') {
                return 'back-to-menu';
            }

            const message: string = error instanceof Error ? error.message : String(error);
            throw new Error(t('command.system-files.error', { message }));
        }
    }
}
