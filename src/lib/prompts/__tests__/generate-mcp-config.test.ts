import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

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
