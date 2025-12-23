import { join } from 'node:path';

import { isEmptyString } from '../helpers';

/** Получает путь к директории user-rules относительно packageDir */
export function getPackagePromptsDir(packageDir: string): string {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }

    return join(packageDir, 'user-rules');
}
