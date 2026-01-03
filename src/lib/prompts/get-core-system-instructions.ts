import { getSystemRulesFile } from '../system-rules-cache';

/** Получает базовый системный промпт */
export async function getCoreSystemInstructions(forceRefresh: boolean = false): Promise<string> {
    return getSystemRulesFile('core-system-instructions.md', forceRefresh);
}
