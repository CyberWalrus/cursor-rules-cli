import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { UserMetaInfo } from '../../model/types/main';
import { getPackagePromptsDir } from './get-package-prompts-dir';

/** Генерирует промпт метаинформации с подстановкой значений */
export async function generateMetaInfoPrompt(
    packageDir: string,
    metaInfo: UserMetaInfo | null | undefined,
): Promise<string> {
    const promptsDir = getPackagePromptsDir(packageDir);
    const templatePath = join(promptsDir, 'meta-info.template.md');
    const template = await readFile(templatePath, 'utf-8');

    const name = metaInfo?.name ?? '';
    const age = metaInfo?.age?.toString() ?? '';
    const role = metaInfo?.role ?? '';
    const stack = metaInfo?.stack ?? '';
    const toolVersions = metaInfo?.toolVersions ?? '';
    const os = metaInfo?.os ?? '';
    const device = metaInfo?.device ?? '';
    const location = metaInfo?.location ?? '';
    const language = metaInfo?.language ?? '';
    const communicationStyle = metaInfo?.communicationStyle ?? '';

    return template
        .replace(/\$\{NAME\}/g, name)
        .replace(/\$\{AGE\}/g, age)
        .replace(/\$\{ROLE\}/g, role)
        .replace(/\$\{STACK\}/g, stack)
        .replace(/\$\{TOOL_VERSIONS\}/g, toolVersions)
        .replace(/\$\{OS\}/g, os)
        .replace(/\$\{DEVICE\}/g, device)
        .replace(/\$\{LOCATION\}/g, location)
        .replace(/\$\{LANGUAGE\}/g, language)
        .replace(/\$\{COMMUNICATION_STYLE\}/g, communicationStyle);
}
