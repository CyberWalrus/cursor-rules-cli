import { GITHUB_REPO } from '../../model';
import { getLatestPromptsVersion, getLatestSystemRulesVersion } from '../github-fetcher';
import { setCachedVersions } from './versions-cache';

/** Проверяет версии prompts и system-rules в фоне и сохраняет в кэш */
export async function checkVersionsInBackground(): Promise<void> {
    try {
        const [promptsVersion, systemRulesVersion] = await Promise.all([
            getLatestPromptsVersion(GITHUB_REPO),
            getLatestSystemRulesVersion(GITHUB_REPO),
        ]);

        setCachedVersions({
            error: false,
            lastCheck: Date.now(),
            promptsVersion,
            systemRulesVersion,
        });
    } catch {
        setCachedVersions({
            error: true,
            lastCheck: Date.now(),
        });
    }
}
