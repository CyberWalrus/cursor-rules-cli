import { isMatch } from 'micromatch';

/** Проверяет, должен ли файл быть проигнорирован */
export function shouldIgnoreFile(filePath: string, ignoreList: string[]): boolean {
    if (ignoreList.length === 0) {
        return false;
    }

    const normalizedPath = filePath.replace(/\\/g, '/');

    return ignoreList.some((pattern) => {
        const normalizedPattern = pattern.replace(/\\/g, '/');

        return isMatch(normalizedPath, normalizedPattern);
    });
}
