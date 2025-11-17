import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MAX_RETRIES = 10;
const RETRY_DELAY = 200;

/** Создает временную директорию для тестов */
async function createTempDir(): Promise<string> {
    const tempBaseDir = tmpdir();
    const tempProjectDir = join(
        tempBaseDir,
        `cursor-rules-test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    );

    await mkdir(tempProjectDir, { recursive: true });

    return tempProjectDir;
}

/** Попытка удалить директорию с повторными попытками */
async function attemptDelete(path: string, attempt: number): Promise<void> {
    if (!path) {
        return;
    }

    try {
        await rm(path, { force: true, recursive: true });
    } catch (error) {
        const nodeError = error as { code?: string };
        const isBusyError = nodeError.code === 'EBUSY';
        const isNotEmptyError = nodeError.code === 'ENOTEMPTY';
        const isRetryableError = isBusyError || isNotEmptyError;

        if (!isRetryableError || attempt === MAX_RETRIES) {
            throw error;
        }

        const delay = RETRY_DELAY * attempt * attempt;
        await new Promise((resolve) => {
            setTimeout(() => resolve(undefined), delay);
        });

        return attemptDelete(path, attempt + 1);
    }
}

/** Удаляет временную директорию с retry логикой для Windows */
async function cleanupTempDir(path: string): Promise<void> {
    if (!path) {
        return;
    }

    await attemptDelete(path, 1);
}

/** Возвращает путь к временной директории проекта */
function getTempProjectDir(): string {
    const tempBaseDir = tmpdir();

    return join(tempBaseDir, `cursor-rules-test-${Date.now()}`);
}

/** Фабрика для работы с временными директориями в тестах */
export const tempDir = {
    cleanup: cleanupTempDir,
    create: createTempDir,
    getProjectDir: getTempProjectDir,
} as const;
