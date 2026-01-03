import type { UserMetaInfo } from '../../model/types/main';
import { getSystemRulesFile } from '../system-rules-cache';

/** Генерирует промпт метаинформации с подстановкой значений */
export async function generateMetaInfoPrompt(
    metaInfo: UserMetaInfo | null | undefined,
    forceRefresh: boolean = false,
): Promise<string> {
    const template = await getSystemRulesFile('meta-info.template.md', forceRefresh);

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
