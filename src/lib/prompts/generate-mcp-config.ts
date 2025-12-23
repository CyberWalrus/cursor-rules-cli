import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isEmptyString } from '../helpers';

/** Генерирует конфиг MCP сервера в виде JSON строки */
export async function generateMcpConfig(packageDir: string): Promise<string> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }

    const mcpConfigPath = join(packageDir, 'mcp.json');
    const content = await readFile(mcpConfigPath, 'utf-8');
    const parsed = JSON.parse(content) as unknown;

    return JSON.stringify(parsed, null, 4);
}
