import type { McpSettings } from '../../../model/types/main';
import { generateMcpConfig } from '../generate-mcp-config';

const mockGetSystemRulesFile = vi.hoisted(() => vi.fn());

vi.mock('../../system-rules-cache', () => ({
    getSystemRulesFile: mockGetSystemRulesFile,
}));

describe('generateMcpConfig', () => {
    const mcpConfig = {
        mcpServers: {
            context7: {
                args: ['-y', '@upstash/context7-mcp@latest'],
                command: 'npx',
            },
            'mcp-validator': {
                args: ['-y', 'mcp-validator'],
                command: 'npx',
                env: {},
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetSystemRulesFile.mockResolvedValue(JSON.stringify(mcpConfig));
    });

    it('должен генерировать конфиг MCP сервера в виде JSON строки', async () => {
        const result = await generateMcpConfig();

        expect(mockGetSystemRulesFile).toHaveBeenCalledWith('mcp.json', false);
        expect(result).toBe(JSON.stringify(mcpConfig, null, 4));
    });

    it('должен подставлять значения из mcpSettings в env только для mcp-validator', async () => {
        const mcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'sk-or-v1-test-key',
            apiProviders: 'Cerebras',
        };

        const result = await generateMcpConfig(mcpSettings);
        const parsed = JSON.parse(result);

        expect(parsed.mcpServers.context7.env).toBeUndefined();
        expect(parsed.mcpServers['mcp-validator'].env).toEqual({
            AI_MODEL: 'openai/gpt-oss-120b',
            API_KEY: 'sk-or-v1-test-key',
            API_PROVIDERS: 'Cerebras',
        });
    });

    it('должен использовать значение по умолчанию для AI_MODEL если не задано', async () => {
        const mcpSettings: McpSettings = {
            aiModel: '',
            apiKey: 'sk-or-v1-test-key',
        };

        const result = await generateMcpConfig(mcpSettings);
        const parsed = JSON.parse(result);

        expect(parsed.mcpServers['mcp-validator'].env.AI_MODEL).toBe('openai/gpt-oss-120b');
    });

    it('должен использовать значение по умолчанию для AI_MODEL если null', async () => {
        const mcpSettings = {
            aiModel: null as never,
            apiKey: 'sk-or-v1-test-key',
        };

        const result = await generateMcpConfig(mcpSettings);
        const parsed = JSON.parse(result);

        expect(parsed.mcpServers['mcp-validator'].env.AI_MODEL).toBe('openai/gpt-oss-120b');
    });

    it('должен не добавлять API_PROVIDERS если не задано', async () => {
        const mcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'sk-or-v1-test-key',
        };

        const result = await generateMcpConfig(mcpSettings);
        const parsed = JSON.parse(result);

        expect(parsed.mcpServers['mcp-validator'].env.API_PROVIDERS).toBeUndefined();
    });
});
