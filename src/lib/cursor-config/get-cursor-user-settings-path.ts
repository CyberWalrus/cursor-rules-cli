import { join } from 'node:path';

import { getCursorConfigDir } from './get-cursor-config-dir';

/** Определяет путь к файлу настроек пользователя Cursor */
export async function getCursorUserSettingsPath(): Promise<string> {
    const configDir = await getCursorConfigDir();

    return join(configDir, 'User', 'settings.json');
}
