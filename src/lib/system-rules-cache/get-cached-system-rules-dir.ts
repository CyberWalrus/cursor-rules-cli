import { join } from 'node:path';

import { getUserConfigDir } from '../user-config';

/** Получает путь к директории кеша системных правил */
export function getCachedSystemRulesDir(): string {
    const userConfigDir = getUserConfigDir();

    return join(userConfigDir, 'cache', 'system-rules');
}
