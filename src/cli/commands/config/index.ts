import { cancel, isCancel, log, select, text } from '@clack/prompts';
import { fileURLToPath } from 'node:url';

import { copyToClipboard } from '../../../lib/clipboard';
import { t } from '../../../lib/i18n';
import { generateMcpConfig } from '../../../lib/prompts';
import { readUserConfig, writeUserConfig } from '../../../lib/user-config';
import type { UserConfig, UserMetaInfo } from '../../../model';
import { getPackageDir } from '../../main/get-package-dir';

const currentFilePath = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);

/** Тип поля конфигурации для редактирования */
type ConfigField = 'finish' | 'language' | 'mcp-config' | 'meta-info';

/** Тип поля метаинформации для редактирования */
type MetaInfoField =
    | 'age'
    | 'communication-style'
    | 'device'
    | 'finish'
    | 'language'
    | 'location'
    | 'name'
    | 'os'
    | 'role'
    | 'stack'
    | 'tool-versions';

const NOT_SET_LABEL = '(не задано)';

/** Форматирует значение для отображения */
function formatValue(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return NOT_SET_LABEL;
    }

    return String(value);
}

/** Редактирует метаинформацию */
// eslint-disable-next-line sonarjs/cognitive-complexity
async function editMetaInfo(currentMetaInfo: UserMetaInfo | null | undefined): Promise<UserMetaInfo | undefined> {
    const metaInfo: UserMetaInfo = currentMetaInfo ? { ...currentMetaInfo } : {};

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const currentName = metaInfo.name ?? '';
        const currentAge = metaInfo.age?.toString() ?? '';
        const currentRole = metaInfo.role ?? '';
        const currentStack = metaInfo.stack ?? '';
        const currentToolVersions = metaInfo.toolVersions ?? '';
        const currentOs = metaInfo.os ?? '';
        const currentDevice = metaInfo.device ?? '';
        const currentLocation = metaInfo.location ?? '';
        const currentLanguage = metaInfo.language ?? '';
        const currentCommunicationStyle = metaInfo.communicationStyle ?? '';

        const field = await select<MetaInfoField>({
            message: t('command.config.meta-info.select-field'),
            options: [
                {
                    label: `${t('command.config.meta-info.field.name')}: ${formatValue(currentName)}`,
                    value: 'name',
                },
                { label: `${t('command.config.meta-info.field.age')}: ${formatValue(currentAge)}`, value: 'age' },
                {
                    label: `${t('command.config.meta-info.field.role')}: ${formatValue(currentRole)}`,
                    value: 'role',
                },
                {
                    label: `${t('command.config.meta-info.field.stack')}: ${formatValue(currentStack)}`,
                    value: 'stack',
                },
                {
                    label: `${t('command.config.meta-info.field.tool-versions')}: ${formatValue(currentToolVersions)}`,
                    value: 'tool-versions',
                },
                { label: `${t('command.config.meta-info.field.os')}: ${formatValue(currentOs)}`, value: 'os' },
                {
                    label: `${t('command.config.meta-info.field.device')}: ${formatValue(currentDevice)}`,
                    value: 'device',
                },
                {
                    label: `${t('command.config.meta-info.field.location')}: ${formatValue(currentLocation)}`,
                    value: 'location',
                },
                {
                    label: `${t('command.config.meta-info.field.language')}: ${formatValue(currentLanguage)}`,
                    value: 'language',
                },
                {
                    label: `${t('command.config.meta-info.field.communication-style')}: ${formatValue(currentCommunicationStyle)}`,
                    value: 'communication-style',
                },
                { label: t('command.config.meta-info.field.finish'), value: 'finish' },
            ],
        });

        if (isCancel(field)) {
            cancel(t('cli.interactive-menu.cancelled'));

            return currentMetaInfo ?? undefined;
        }

        if (field === 'finish') {
            break;
        }

        let value: number | string | undefined;

        if (field === 'age') {
            const ageInput = await text({
                initialValue: currentAge,
                message: t('command.config.meta-info.prompt.age'),
            });

            if (isCancel(ageInput)) {
                continue;
            }

            const ageValue = ageInput.trim();
            value = ageValue === '' ? undefined : Number.parseInt(ageValue, 10);
        } else {
            const prompts: Record<string, string> = {
                'communication-style': t('command.config.meta-info.prompt.communication-style'),
                device: t('command.config.meta-info.prompt.device'),
                language: t('command.config.meta-info.prompt.language'),
                location: t('command.config.meta-info.prompt.location'),
                name: t('command.config.meta-info.prompt.name'),
                os: t('command.config.meta-info.prompt.os'),
                role: t('command.config.meta-info.prompt.role'),
                stack: t('command.config.meta-info.prompt.stack'),
                'tool-versions': t('command.config.meta-info.prompt.tool-versions'),
            };

            let initialValue = '';
            if (field === 'name') {
                initialValue = currentName;
            } else if (field === 'role') {
                initialValue = currentRole;
            } else if (field === 'stack') {
                initialValue = currentStack;
            } else if (field === 'tool-versions') {
                initialValue = currentToolVersions;
            } else if (field === 'os') {
                initialValue = currentOs;
            } else if (field === 'device') {
                initialValue = currentDevice;
            } else if (field === 'location') {
                initialValue = currentLocation;
            } else if (field === 'language') {
                initialValue = currentLanguage;
            } else {
                initialValue = currentCommunicationStyle;
            }

            const fieldInput = await text({
                initialValue,
                message: prompts[field],
            });

            if (isCancel(fieldInput)) {
                continue;
            }

            value = fieldInput.trim() === '' ? undefined : fieldInput.trim();
        }

        const fieldMap: Record<string, keyof UserMetaInfo> = {
            age: 'age',
            'communication-style': 'communicationStyle',
            device: 'device',
            language: 'language',
            location: 'location',
            name: 'name',
            os: 'os',
            role: 'role',
            stack: 'stack',
            'tool-versions': 'toolVersions',
        };

        const key = fieldMap[field];
        if (key) {
            metaInfo[key] = value as never;
        }
    }

    return Object.keys(metaInfo).length === 0 ? undefined : metaInfo;
}

/** Команда настройки глобальной конфигурации */
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function configCommand(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const currentConfig = await readUserConfig();
        const currentLanguage = currentConfig?.language ?? 'en';
        const currentMetaInfo = currentConfig?.metaInfo;

        const field = await select<ConfigField>({
            message: t('command.config.select-field'),
            options: [
                { label: `${t('command.config.field.language')}: ${currentLanguage}`, value: 'language' },
                {
                    label: `${t('command.config.field.meta-info')}: ${currentMetaInfo ? '(настроено)' : '(не настроено)'}`,
                    value: 'meta-info',
                },
                { label: t('command.config.field.mcp-config'), value: 'mcp-config' },
                { label: t('command.config.field.finish'), value: 'finish' },
            ],
        });

        if (isCancel(field)) {
            cancel(t('cli.interactive-menu.cancelled'));

            return;
        }

        if (field === 'finish') {
            break;
        }

        if (field === 'language') {
            const language = await select<'en' | 'ru'>({
                initialValue: currentLanguage,
                message: t('command.config.select-language'),
                options: [
                    { label: t('command.config.language.en'), value: 'en' },
                    { label: t('command.config.language.ru'), value: 'ru' },
                ],
            });

            if (isCancel(language)) {
                continue;
            }

            const config: UserConfig = {
                ...currentConfig,
                language,
            };

            await writeUserConfig(config);
            log.success(t('command.config.success', { language }));
        } else if (field === 'meta-info') {
            const metaInfo = await editMetaInfo(currentMetaInfo);

            const config: UserConfig = {
                language: currentConfig?.language ?? 'en',
                ...currentConfig,
                metaInfo,
            };

            await writeUserConfig(config);
            log.success(t('command.config.meta-info.success'));
        } else if (field === 'mcp-config') {
            try {
                const packageDir = getPackageDir(currentFilePath);
                if (packageDir === null || packageDir === undefined) {
                    throw new Error(t('cli.main.package-dir-not-found'));
                }

                const content = await generateMcpConfig(packageDir);
                await copyToClipboard(content);
                log.success(t('command.config.mcp-config.copied'));
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                log.error(t('command.system-files.error', { message }));
            }
        }
    }
}
