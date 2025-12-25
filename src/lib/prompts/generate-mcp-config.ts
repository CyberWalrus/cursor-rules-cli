import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { McpConfig, McpSettings } from '../../model/types/main';
import { isEmptyString } from '../helpers';

/** Генерирует конфиг MCP сервера в виде JSON строки */
export async function generateMcpConfig(packageDir: string, mcpSettings?: McpSettings | null): Promise<string> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }

    const mcpConfigPath = join(packageDir, 'mcp.json');
    const content = await readFile(mcpConfigPath, 'utf-8');
    const parsed = JSON.parse(content) as unknown;

    const config = parsed as McpConfig;

    if (mcpSettings !== null && mcpSettings !== undefined) {
        const DEFAULT_AI_MODEL = 'openai/gpt-oss-120b';

        for (const serverName of Object.keys(config.mcpServers)) {
            const server = config.mcpServers[serverName];

            if (server.env === null || server.env === undefined) {
                server.env = {};
            }

            server.env.API_KEY = mcpSettings.apiKey;
            server.env.AI_MODEL =
                mcpSettings.aiModel === null || mcpSettings.aiModel === undefined || mcpSettings.aiModel === ''
                    ? DEFAULT_AI_MODEL
                    : mcpSettings.aiModel;

            if (mcpSettings.apiProviders !== null && mcpSettings.apiProviders !== undefined) {
                server.env.API_PROVIDERS = mcpSettings.apiProviders;
            }
        }
    }

    return JSON.stringify(config, null, 4);
}
