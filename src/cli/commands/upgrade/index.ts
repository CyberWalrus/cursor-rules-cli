import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { calculateDiff } from '../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget, readConfigFile, writeConfigFile } from '../../../lib/file-operations';
import { fetchPromptsTarball, getLatestPromptsVersion } from '../../../lib/github-fetcher';
import { askConfirmation } from '../../../lib/helpers';
import { compareCalVerVersions } from '../../../lib/version-manager/compare-calver-versions';
import { getCurrentVersion } from '../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { GITHUB_REPO, upgradeCommandParamsSchema } from '../../../model';

/** Обновляет правила до последней версии */
export async function upgradeCommand(packageDir: string, targetDir: string): Promise<void> {
    try {
        upgradeCommandParamsSchema.parse({ packageDir, targetDir });
    } catch (error) {
        const zodError = error as { issues?: Array<{ path: Array<number | string> }> };
        const firstIssue = zodError.issues?.[0];
        if (firstIssue) {
            const firstPath = firstIssue.path[0];
            if (firstPath === 'packageDir') {
                throw new Error('packageDir is required');
            }
            if (firstPath === 'targetDir') {
                throw new Error('targetDir is required');
            }
        }
        throw error;
    }

    const currentVersion = await getCurrentVersion(targetDir);
    if (currentVersion === null) {
        throw new Error('Rules not initialized. Run init command first.');
    }

    const config = await readConfigFile(targetDir);
    if (config === null) {
        throw new Error('Config file not found');
    }

    const ruleSetsToUpdate = config.ruleSets.filter((ruleSet) => ruleSet.update);

    if (ruleSetsToUpdate.length === 0) {
        return;
    }

    const knownRuleSetIds = ['base'];
    const unknownRuleSets = ruleSetsToUpdate.filter((ruleSet) => !knownRuleSetIds.includes(ruleSet.id));

    if (unknownRuleSets.length > 0) {
        console.warn(
            `Warning: Unknown rule set IDs found: ${unknownRuleSets.map((rs) => rs.id).join(', ')}. Proceeding anyway.`,
        );
    }

    const currentPromptsVersion = config.promptsVersion ?? config.version;

    if (currentPromptsVersion == null) {
        throw new Error('Current prompts version not found in config');
    }

    const latestPromptsVersion = await getLatestPromptsVersion(GITHUB_REPO);

    if (latestPromptsVersion == null) {
        console.warn(
            `⚠️ No internet connection. Cannot fetch latest version from GitHub. Current version: ${currentPromptsVersion}`,
        );

        const shouldUseLocal = await askConfirmation('Do you want to continue with the current local version?');

        if (!shouldUseLocal) {
            throw new Error('Upgrade cancelled by user');
        }

        console.log(`✓ Using current local version ${currentPromptsVersion}`);

        return;
    }

    if (currentPromptsVersion === latestPromptsVersion) {
        console.log('✓ Prompts are up to date');

        return;
    }

    const versionComparison = compareCalVerVersions(currentPromptsVersion, latestPromptsVersion);
    const reverseComparison = compareCalVerVersions(latestPromptsVersion, currentPromptsVersion);

    if (versionComparison.changeType === 'none' && reverseComparison.changeType !== 'none') {
        console.warn(`⚠️ Local version ${currentPromptsVersion} is newer than GitHub version ${latestPromptsVersion}.`);

        const shouldDowngrade = await askConfirmation(
            `Do you want to downgrade from ${currentPromptsVersion} to ${latestPromptsVersion}?`,
        );

        if (!shouldDowngrade) {
            throw new Error('Upgrade cancelled by user');
        }
    }

    const tmpDir = join(tmpdir(), `cursor-rules-${Date.now()}`);

    try {
        await fetchPromptsTarball(GITHUB_REPO, latestPromptsVersion, tmpDir);
        await calculateDiff(tmpDir, targetDir);
        await copyRulesToTarget(tmpDir, targetDir, config.ignoreList ?? [], config.fileOverrides ?? []);

        const cliVersion = await getPackageVersion(packageDir);
        config.cliVersion = cliVersion;
        config.promptsVersion = latestPromptsVersion;
        config.updatedAt = new Date().toISOString();
        await writeConfigFile(targetDir, config);

        console.log(`✓ Upgraded from ${currentPromptsVersion} to ${latestPromptsVersion}`);
    } finally {
        await rm(tmpDir, { force: true, recursive: true });
    }
}
