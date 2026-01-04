import micromatch from 'micromatch';

/** Проверяет, должен ли файл быть проигнорирован */
export function shouldIgnoreFile(filePath: string, ignoreList: string[]): boolean {
    if (ignoreList.length === 0) {
        return false;
    }

    const normalizedPath = filePath.replace(/\\/g, '/');
    const normalizedPatterns = ignoreList.map((pattern) => pattern.replace(/\\/g, '/'));

    const negativePatterns = normalizedPatterns
        .filter((pattern) => pattern.startsWith('!'))
        .map((pattern) => pattern.slice(1));
    const positivePatterns = normalizedPatterns.filter((pattern) => !pattern.startsWith('!'));

    const isMatchPositive = positivePatterns.some((pattern) => micromatch.isMatch(normalizedPath, pattern));
    const isMatchNegative = negativePatterns.some((pattern) => micromatch.isMatch(normalizedPath, pattern));

    if (isMatchNegative) {
        return false;
    }

    return isMatchPositive;
}
