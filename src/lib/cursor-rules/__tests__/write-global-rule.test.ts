import { posix } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { writeGlobalRule } from '../write-global-rule';

const { mockGetCursorRulesDir, mockMkdir, mockWriteFile } = vi.hoisted(() => ({
    mockGetCursorRulesDir: vi.fn(),
    mockMkdir: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('../../cursor-config', () => ({
    getCursorRulesDir: mockGetCursorRulesDir,
}));

vi.mock('node:fs/promises', () => ({
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
}));

describe('writeGlobalRule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен записывать файл правила', async () => {
        const mockRulesDir = '/Users/test/.cursor/rules';
        const ruleName = 'meta-info.md';
        const ruleContent = '---\nid: test\n---\n# Test Rule';

        mockGetCursorRulesDir.mockResolvedValue(mockRulesDir);
        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        await writeGlobalRule(ruleName, ruleContent);

        const expectedRulePath = posix.join(mockRulesDir, ruleName);
        const actualMkdirCall = mockMkdir.mock.calls[0]?.[0] as string | undefined;
        const actualWriteFileCall = mockWriteFile.mock.calls[0]?.[0] as string | undefined;

        expect(actualMkdirCall).toBeDefined();
        if (!actualMkdirCall) {
            throw new Error('mockMkdir was not called');
        }
        expect(posix.normalize(actualMkdirCall.replace(/\\/g, '/'))).toBe(posix.normalize(mockRulesDir));
        expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
        expect(actualWriteFileCall).toBeDefined();
        if (!actualWriteFileCall) {
            throw new Error('mockWriteFile was not called');
        }
        expect(posix.normalize(actualWriteFileCall.replace(/\\/g, '/'))).toBe(posix.normalize(expectedRulePath));
        expect(mockWriteFile).toHaveBeenCalledWith(expect.any(String), ruleContent, 'utf-8');
    });
});
