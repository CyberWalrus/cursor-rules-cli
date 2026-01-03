import type { McpConfig, McpSettings } from '../../model/types/main';
import { getSystemRulesFile } from '../system-rules-cache';

/** Генерирует конфиг MCP сервера в виде JSON строки */
export async function generateMcpConfig(
    mcpSettings?: McpSettings | null,
    forceRefresh: boolean = false,
): Promise<string> {
    const content = await getSystemRulesFile('mcp.json', forceRefresh);
    const parsed = JSON.parse(content) as unknown;

    const config = parsed as McpConfig;

    if (mcpSettings != null) {
        const DEFAULT_AI_MODEL = 'openai/gpt-oss-120b';
        const server = config.mcpServers['mcp-validator'];

        if (server !== null && server !== undefined) {
            if (server.env === null || server.env === undefined) {
                server.env = {};
            }

            server.env.API_KEY = mcpSettings.apiKey;
            const aiModel = mcpSettings.aiModel?.trim() || DEFAULT_AI_MODEL;
            server.env.AI_MODEL = aiModel;

            if (mcpSettings.apiProviders != null) {
                server.env.API_PROVIDERS = mcpSettings.apiProviders;
            }
        }
    }

    return JSON.stringify(config, null, 4);
}
