import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getPackagePromptsDir } from './get-package-prompts-dir';

/** Получает базовый системный промпт */
export async function getCoreSystemInstructions(packageDir: string): Promise<string> {
    const promptsDir = getPackagePromptsDir(packageDir);
    const filePath = join(promptsDir, 'core-system-instructions.md');

    return readFile(filePath, 'utf-8');
}
