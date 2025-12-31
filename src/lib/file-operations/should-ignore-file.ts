import micromatch from 'micromatch';

/** Проверяет, должен ли файл быть проигнорирован */
export function shouldIgnoreFile(filePath: string, ignoreList: string[]): boolean {
    if (ignoreList.length === 0) {
        return false;
    }

    const normalizedPath = filePath.replace(/\\/g, '/');
    const matches = micromatch(
        [normalizedPath],
        ignoreList.map((pattern) => pattern.replace(/\\/g, '/')),
    );

    return matches.length > 0;
}
