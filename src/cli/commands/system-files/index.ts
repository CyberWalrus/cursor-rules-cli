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
import type { SystemFilesAction, SystemFilesCommandResult, SystemFileType } from './types';

/** Выполняет команду работы с системными файлами */
export async function systemFilesCommand(): Promise<SystemFilesCommandResult> {
    let isGithubError = false;

    try {
        const latestVersion = await getLatestSystemRulesVersion(GITHUB_REPO);
        if (latestVersion === null) {
            isGithubError = true;
        }
    } catch {
        isGithubError = true;
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

        return 'back-to-menu';
    }

    try {
        let content: string;

        switch (fileType) {
            case 'core-instructions': {
                const rawContent = await getCoreSystemInstructions(isGithubError);
                content = removeYamlFrontmatter(rawContent);
                break;
            }
            case 'meta-info': {
                let userConfig = await readUserConfig();
                const validation = validateMetaInfo(userConfig?.metaInfo);

                if (!validation.isValid) {
                    log.info(t('command.system-files.meta-info.missing-fields'));

                    const filledMetaInfo = await fillMissingMetaInfo(userConfig?.metaInfo, validation.missingFields);

                    if (filledMetaInfo === null) {
                        cancel(t('cli.interactive-menu.cancelled'));

                        return 'back-to-menu';
                    }

                    userConfig = {
                        ...userConfig,
                        language: userConfig?.language ?? 'en',
                        metaInfo: filledMetaInfo,
                    };

                    await writeUserConfig(userConfig);
                }

                const rawContent = await generateMetaInfoPrompt(userConfig?.metaInfo, isGithubError);
                content = removeYamlFrontmatter(rawContent);
                break;
            }
            case 'current-date': {
                const rawContent = await generateCurrentDatePrompt(isGithubError);
                content = removeYamlFrontmatter(rawContent);
                break;
            }
            case 'mcp-config': {
                let userConfig = await readUserConfig();
                const validation = validateMcpSettings(userConfig?.mcpSettings);

                if (!validation.isValid) {
                    log.info(t('command.system-files.mcp-config.missing-fields'));

                    const filledMcpSettings = await fillMissingMcpSettings(
                        userConfig?.mcpSettings,
                        validation.missingFields,
                    );

                    if (filledMcpSettings === null) {
                        cancel(t('cli.interactive-menu.cancelled'));

                        return 'back-to-menu';
                    }

                    userConfig = {
                        ...userConfig,
                        language: userConfig?.language ?? 'en',
                        mcpSettings: filledMcpSettings,
                    };

                    await writeUserConfig(userConfig);
                }

                content = await generateMcpConfig(userConfig?.mcpSettings, isGithubError);
                break;
            }
        }

        await copyToClipboard(content);

        log.success(COPY_MESSAGES[fileType]);

        const action = await select<SystemFilesAction>({
            message: t('command.system-files.select-action'),
            options: [
                { label: t('command.system-files.back-to-menu'), value: 'back-to-menu' },
                { label: t('command.system-files.finish'), value: 'finish' },
            ],
        });

        if (isCancel(action)) {
            cancel(t('cli.interactive-menu.cancelled'));
            process.exit(0);
        }

        if (action === 'finish') {
            outro(t('cli.interactive-menu.goodbye'));

            return 'finish';
        }

        return 'back-to-menu';
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(t('command.system-files.error', { message }));
    }
}
