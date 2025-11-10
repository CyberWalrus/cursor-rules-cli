/** Получает последнюю версию промптов из GitHub репозитория */
export async function getLatestPromptsVersion(repo: string): Promise<string> {
    if (repo === null || repo === undefined) {
        throw new Error('repo is required');
    }

    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
        'User-Agent': 'cursor-rules-cli',
        ...(token !== undefined && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=100`, {
        headers,
    });

    if (!response.ok) {
        if (response.status === 403) {
            const message =
                token === undefined
                    ? 'GitHub API error: 403 Forbidden. Set GITHUB_TOKEN environment variable to increase rate limit (60 req/hour per IP address without token).'
                    : 'GitHub API error: 403 Forbidden. Check if GITHUB_TOKEN is valid and has required permissions.';
            throw new Error(message);
        }
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const tags = (await response.json()) as Array<{ name: string }>;
    const promptTags = tags.filter((t) => t.name.startsWith('prompts/v'));

    if (promptTags.length === 0) {
        throw new Error('No prompts version found');
    }

    const sortedTags = promptTags.sort((a, b) => {
        const versionA = a.name.replace('prompts/v', '');
        const versionB = b.name.replace('prompts/v', '');

        return versionB.localeCompare(versionA, undefined, { numeric: true, sensitivity: 'base' });
    });

    const latestTag = sortedTags[0];

    return latestTag.name.replace('prompts/v', '');
}
