import { cp, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { SYSTEM_RULES_DIR } from '../../model';
import { isEmptyString } from '../helpers';
import { pathExists } from './path-exists';

/** Рекурсивно копирует файлы из директории */
async function copyDirectoryRecursive(sourceDir: string, targetDir: string): Promise<void> {
    const entries = await readdir(sourceDir, { withFileTypes: true });

    await Promise.all(
        entries.map(async (entry) => {
            const sourcePath = join(sourceDir, entry.name);
            const targetPath = join(targetDir, entry.name);

            if (entry.isDirectory()) {
                await mkdir(targetPath, { recursive: true });
                await copyDirectoryRecursive(sourcePath, targetPath);
            } else if (entry.isFile()) {
                const targetFileDir = dirname(targetPath);
                await mkdir(targetFileDir, { recursive: true });
                await cp(sourcePath, targetPath, { force: true });
            }
        }),
    );
}

/** Копирует системные правила из временной директории в целевую */
export async function copySystemRulesToTarget(sourceDir: string, targetDir: string): Promise<void> {
    if (isEmptyString(sourceDir)) {
        throw new Error('sourceDir is required');
    }
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const sourceSystemRulesPath = join(sourceDir, SYSTEM_RULES_DIR);
    const sourceExists = await pathExists(sourceSystemRulesPath);

    if (!sourceExists) {
        return;
    }

    const targetSystemRulesPath = join(targetDir, '.cursor', SYSTEM_RULES_DIR);
    await mkdir(targetSystemRulesPath, { recursive: true });
    await copyDirectoryRecursive(sourceSystemRulesPath, targetSystemRulesPath);
}
