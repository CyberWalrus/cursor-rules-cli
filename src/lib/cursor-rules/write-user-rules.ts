import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { CursorUserSettings, UserRule } from '../../model/types/main';
import { getCursorUserSettingsPath } from '../cursor-config';
import { pathExists } from '../file-operations/path-exists';

/** Записывает User Rules в настройки Cursor */
export async function writeUserRules(rules: UserRule[]): Promise<void> {
    if (rules === null || rules === undefined) {
        throw new Error('rules is required');
    }

    const settingsPath = await getCursorUserSettingsPath();
    const settingsDir = dirname(settingsPath);
    let settings: CursorUserSettings = {};

    const exists = await pathExists(settingsPath);

    if (exists === true) {
        try {
            const content = await readFile(settingsPath, 'utf-8');
            const parsed = JSON.parse(content) as unknown;

            if (typeof parsed === 'object' && parsed !== null) {
                settings = parsed as CursorUserSettings;
            }
        } catch {
            settings = {};
        }
    }

    settings['cursor.userRules'] = rules;

    const content = JSON.stringify(settings, null, 4);

    await mkdir(settingsDir, { recursive: true });
    await writeFile(settingsPath, content, 'utf-8');
}
