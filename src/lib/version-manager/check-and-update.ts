import type { CheckAndUpdateOptions } from '../../model';
import { compareVersions } from './compare-versions';
import { getNpmVersion } from './get-npm-version';
import { updatePackage } from './update-package';

/** Проверяет версию пакета и обновляет до последней версии при необходимости */
export async function checkAndUpdatePackage(
    packageName: string,
    currentVersion: string,
    options?: CheckAndUpdateOptions,
): Promise<boolean> {
    if (currentVersion === null || currentVersion === undefined) {
        throw new Error('currentVersion is required');
    }

    if (packageName === null || packageName === undefined) {
        throw new Error('packageName is required');
    }

    try {
        const latestVersion = await getNpmVersion(packageName);
        const comparison = compareVersions(currentVersion, latestVersion);

        if (comparison.changeType === 'none') {
            return false;
        }

        if (options?.isSkipUpdate) {
            return false;
        }

        await updatePackage(packageName);

        return true;
    } catch (error) {
        const message: string = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to check and update package: ${message}`);
    }
}
