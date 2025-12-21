import { readFile } from 'node:fs/promises';

import type { CursorUserSettings, UserRule } from '../../model/types/main';
import { getCursorUserSettingsPath } from '../cursor-config';
import { pathExists } from '../file-operations/path-exists';

/** Читает User Rules из настроек Cursor */
export async function readUserRules(): Promise<UserRule[] | null> {
    try {
        const settingsPath = await getCursorUserSettingsPath();
        const exists = await pathExists(settingsPath);

        if (exists === false) {
            return null;
        }

        const content = await readFile(settingsPath, 'utf-8');
        const parsed = JSON.parse(content) as unknown;

        if (typeof parsed !== 'object' || parsed === null) {
            return null;
        }

        const settings = parsed as CursorUserSettings;
        const userRules = settings['cursor.userRules'];

        if (userRules === null || userRules === undefined) {
            return null;
        }

        if (!Array.isArray(userRules)) {
            return null;
        }

        return userRules;
    } catch {
        return null;
    }
}
