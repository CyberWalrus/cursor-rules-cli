import { getPackageVersion } from '../../lib/version-manager/get-package-version';
import { notifyIfUpdateAvailable } from '../../lib/version-manager/notify-update';
import { PACKAGE_NAME } from './constants';

/** Проверяет и уведомляет о доступной новой версии */
export async function ensureLatestVersion(packageDir: string): Promise<void> {
    if (packageDir === null || packageDir === undefined) {
        throw new Error('packageDir is required');
    }

    const currentVersion = await getPackageVersion(packageDir);
    await notifyIfUpdateAvailable(PACKAGE_NAME, currentVersion);
}
