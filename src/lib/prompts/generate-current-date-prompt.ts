import { getSystemRulesFile } from '../system-rules-cache';

/** Форматирует текущую дату в формате YYYY-M-D */
function formatCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return `${year}-${month}-${day}`;
}

/** Генерирует промпт текущей даты с подстановкой значения */
export async function generateCurrentDatePrompt(forceRefresh: boolean = false): Promise<string> {
    const template = await getSystemRulesFile('current-date.template.md', forceRefresh);
    const currentDate = formatCurrentDate();

    return template.replace(/\$\{CURRENT_DATE\}/g, currentDate);
}
