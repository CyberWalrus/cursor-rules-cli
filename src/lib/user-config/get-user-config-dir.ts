import { platform } from 'node:os';
import { join } from 'node:path';

import { isEmptyString } from '../helpers';

/** Определяет директорию для хранения глобальной конфигурации пользователя */
export function getUserConfigDir(): string {
    const osPlatform = platform();
    let configDir: string;

    if (osPlatform === 'win32') {
        const appData = process.env.APPDATA;

        if (appData === null || appData === undefined || isEmptyString(appData)) {
            throw new Error('APPDATA environment variable is not set');
        }

        configDir = join(appData, 'cursor-rules-cli');
    } else if (osPlatform === 'darwin') {
        const home = process.env.HOME;

        if (home === null || home === undefined || isEmptyString(home)) {
            throw new Error('HOME environment variable is not set');
        }

        configDir = join(home, 'Library', 'Preferences', 'cursor-rules-cli');
    } else {
        const xdgConfigHome = process.env.XDG_CONFIG_HOME;
        const home = process.env.HOME;

        if (home === null || home === undefined || isEmptyString(home)) {
            throw new Error('HOME environment variable is not set');
        }

        if (xdgConfigHome !== null && xdgConfigHome !== undefined && !isEmptyString(xdgConfigHome)) {
            configDir = join(xdgConfigHome, 'cursor-rules-cli');
        } else {
            configDir = join(home, '.config', 'cursor-rules-cli');
        }
    }

    return configDir;
}
