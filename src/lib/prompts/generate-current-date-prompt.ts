import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getPackagePromptsDir } from './get-package-prompts-dir';

/** Форматирует текущую дату в формате YYYY-M-D */
function formatCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return `${year}-${month}-${day}`;
}

/** Генерирует промпт текущей даты с подстановкой значения */
export async function generateCurrentDatePrompt(packageDir: string): Promise<string> {
    const promptsDir = getPackagePromptsDir(packageDir);
    const templatePath = join(promptsDir, 'current-date.template.md');
    const template = await readFile(templatePath, 'utf-8');
    const currentDate = formatCurrentDate();

    return template.replace(/\$\{CURRENT_DATE\}/g, currentDate);
}
