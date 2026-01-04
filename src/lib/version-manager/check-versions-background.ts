import { GITHUB_REPO } from '../../model';
import { getLatestPromptsVersion, getLatestSystemRulesVersion } from '../github-fetcher';
import { setCachedVersions } from './helpers';

/** Проверяет версии prompts и system-rules в фоне и сохраняет в кэш */
export async function checkVersionsInBackground(): Promise<void> {
    try {
        const [promptsVersion, systemRulesVersion] = await Promise.all([
            getLatestPromptsVersion(GITHUB_REPO),
            getLatestSystemRulesVersion(GITHUB_REPO),
        ]);

        setCachedVersions({
            isError: false,
            lastCheck: Date.now(),
            promptsVersion,
            systemRulesVersion,
        });
    } catch {
        setCachedVersions({
            isError: true,
            lastCheck: Date.now(),
        });
    }
}
