import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { McpSettings } from '../../../model/types/main';
import { generateMcpConfig } from '../generate-mcp-config';

vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
}));

const mockReadFile = vi.mocked(readFile);

describe('generateMcpConfig', () => {
    const packageDir = '/test/package';
    const mcpConfigPath = join(packageDir, 'mcp.json');
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
        mockReadFile.mockResolvedValue(JSON.stringify(mcpConfig));
    });

    it('должен генерировать конфиг MCP сервера в виде JSON строки', async () => {
        const result = await generateMcpConfig(packageDir);

        expect(mockReadFile).toHaveBeenCalledWith(mcpConfigPath, 'utf-8');
        expect(result).toBe(JSON.stringify(mcpConfig, null, 4));
    });

    it('должен подставлять значения из mcpSettings в env всех серверов', async () => {
        const mcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'sk-or-v1-test-key',
            apiProviders: 'Cerebras',
        };

        const result = await generateMcpConfig(packageDir, mcpSettings);
        const parsed = JSON.parse(result);

        expect(parsed.mcpServers.context7.env).toEqual({
            AI_MODEL: 'openai/gpt-oss-120b',
            API_KEY: 'sk-or-v1-test-key',
            API_PROVIDERS: 'Cerebras',
        });
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

        const result = await generateMcpConfig(packageDir, mcpSettings);
        const parsed = JSON.parse(result);

        expect(parsed.mcpServers.context7.env.AI_MODEL).toBe('openai/gpt-oss-120b');
    });

    it('должен использовать значение по умолчанию для AI_MODEL если null', async () => {
        const mcpSettings = {
            aiModel: null as never,
            apiKey: 'sk-or-v1-test-key',
        };

        const result = await generateMcpConfig(packageDir, mcpSettings);
        const parsed = JSON.parse(result);

        expect(parsed.mcpServers.context7.env.AI_MODEL).toBe('openai/gpt-oss-120b');
    });

    it('должен не добавлять API_PROVIDERS если не задано', async () => {
        const mcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'sk-or-v1-test-key',
        };

        const result = await generateMcpConfig(packageDir, mcpSettings);
        const parsed = JSON.parse(result);

        expect(parsed.mcpServers.context7.env.API_PROVIDERS).toBeUndefined();
    });

    it('должен выбрасывать ошибку если packageDir пустой', async () => {
        await expect(generateMcpConfig('')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', async () => {
        await expect(generateMcpConfig(null as never)).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir undefined', async () => {
        await expect(generateMcpConfig(undefined as never)).rejects.toThrow('packageDir is required');
    });
});
