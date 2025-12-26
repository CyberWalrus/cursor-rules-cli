/** Удаляет YAML frontmatter из текста промпта */
export function removeYamlFrontmatter(text: string): string {
    if (text === null || text === undefined || text === '') {
        return text;
    }

    const trimmed = text.trim();

    if (!trimmed.startsWith('---')) {
        return text;
    }

    const lines = trimmed.split('\n');
    const firstLine = lines[0]?.trim();

    if (firstLine !== '---') {
        return text;
    }

    let endIndex = -1;

    for (let i = 1; i < lines.length; i += 1) {
        const line = lines[i]?.trim();

        if (line === '---') {
            endIndex = i;

            break;
        }
    }

    if (endIndex === -1) {
        return text;
    }

    const contentLines = lines.slice(endIndex + 1);

    return contentLines.join('\n').trimStart();
}
