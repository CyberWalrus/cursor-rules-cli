import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { updateCommand } from '../../cli/commands/update/index';
import type { RulesConfig } from '../../model';
import { VERSION_FILE_NAME } from '../../model';
import { createVersionFile } from './helpers/create-version-file';
import { tempDir } from './helpers/temp-dir';

describe('Update Command E2E', () => {
    let tempDirPathPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        tempDirPathPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPathPath);
    });

    it('должен выбрасывать ошибку если правила не инициализированы', async () => {
        await expect(updateCommand(packageDir, tempDirPathPath)).rejects.toThrow(
            'Rules not initialized. Run init command first.',
        );
    });

    it('должен пропускать обновление если версии идентичны', async () => {
        await initCommand(packageDir, tempDirPathPath);

        const configFilePath = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const configBeforeUpdate = await readFile(configFilePath, 'utf-8');

        await updateCommand(packageDir, tempDirPathPath);

        const configAfterUpdate = await readFile(configFilePath, 'utf-8');

        expect(configBeforeUpdate).toBe(configAfterUpdate);
    });

    it('должен успешно обновлять при наличии diff', async () => {
        await createVersionFile(tempDirPathPath, '0.0.1');

        const configFilePathBefore = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePathBefore, 'utf-8')) as RulesConfig;

        await updateCommand(packageDir, tempDirPathPath);

        const configFilePathAfter = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentAfter = JSON.parse(await readFile(configFilePathAfter, 'utf-8')) as RulesConfig;

        expect(contentAfter.version).not.toBe(contentBefore.version);
        expect(contentAfter.updatedAt).not.toBe(contentBefore.updatedAt);
    });

    it('должен обновлять updatedAt при обновлении', async () => {
        await createVersionFile(tempDirPathPath, '0.0.1');

        const configFilePath = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampBefore = new Date(contentBefore.updatedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await updateCommand(packageDir, tempDirPathPath);

        const contentAfter = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampAfter = new Date(contentAfter.updatedAt).getTime();

        expect(timestampAfter).toBeGreaterThan(timestampBefore);
    });
});
