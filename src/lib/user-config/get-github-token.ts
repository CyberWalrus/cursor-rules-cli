import { readUserConfig } from './read-user-config';

/** Получает GitHub API токен из конфига или переменной окружения */
export async function getGithubToken(): Promise<string | undefined> {
    const config = await readUserConfig();

    if (config?.githubToken) {
        return config.githubToken;
    }

    return process.env.GITHUB_TOKEN;
}
