import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getCoreSystemInstructions } from '../get-core-system-instructions';

vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
}));

vi.mock('../get-package-prompts-dir', () => ({
    getPackagePromptsDir: (packageDir: string) => join(packageDir, 'system-rules'),
}));

const mockReadFile = vi.mocked(readFile);

describe('getCoreSystemInstructions', () => {
    const packageDir = '/test/package';
    const filePath = join(packageDir, 'system-rules', 'core-system-instructions.md');
    const content = '# Core System Principles\n\nSome content here.';

    beforeEach(() => {
        vi.clearAllMocks();
        mockReadFile.mockResolvedValue(content);
    });

    it('должен читать файл core-system-instructions.md', async () => {
        const result = await getCoreSystemInstructions(packageDir);

        expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf-8');
        expect(result).toBe(content);
    });
});
