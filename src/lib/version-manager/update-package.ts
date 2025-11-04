import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { isEmptyString } from '../helpers';

const execAsync = promisify(exec);

/** Обновляет пакет до последней версии через npm */
export async function updatePackage(packageName: string): Promise<void> {
    if (isEmptyString(packageName)) {
        throw new Error('packageName is required');
    }

    const command = `npm install -g ${packageName}@latest`;

    try {
        const { stderr } = await execAsync(command);

        if (stderr && !stderr.includes('npm WARN')) {
            throw new Error(`npm install failed: ${stderr}`);
        }
    } catch (error) {
        if (error instanceof Error && 'code' in error && typeof error.code === 'number') {
            throw new Error(`Failed to update package: process exited with code ${error.code}`);
        }

        if (error instanceof Error) {
            throw new Error(`Failed to update package: ${error.message}`);
        }

        throw new Error(`Failed to update package: ${String(error)}`);
    }
}
