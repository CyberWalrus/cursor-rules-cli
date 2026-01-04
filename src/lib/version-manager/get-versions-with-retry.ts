import { GITHUB_REPO } from '../../model';
import { getLatestPromptsVersion, getLatestSystemRulesVersion } from '../github-fetcher';
import { clearBackgroundError, getCachedVersions, hasBackgroundError } from './helpers';

/** Получает версии с повторной попыткой при ошибке фоновой загрузки */
export async function getVersionsWithRetry(): Promise<{
    promptsVersion: string | null;
    systemRulesVersion: string | null;
}> {
    const cached = getCachedVersions();

    if (hasBackgroundError() || cached.promptsVersion === null || cached.systemRulesVersion === null) {
        clearBackgroundError();

        try {
            const [promptsVersion, systemRulesVersion] = await Promise.all([
                getLatestPromptsVersion(GITHUB_REPO),
                getLatestSystemRulesVersion(GITHUB_REPO),
            ]);

            return {
                promptsVersion,
                systemRulesVersion,
            };
        } catch {
            return {
                promptsVersion: null,
                systemRulesVersion: null,
            };
        }
    }

    return {
        promptsVersion: cached.promptsVersion,
        systemRulesVersion: cached.systemRulesVersion,
    };
}
