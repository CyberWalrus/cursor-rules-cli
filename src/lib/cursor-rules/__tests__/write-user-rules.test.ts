import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserRule } from '../../../model/types/main';
import { writeUserRules } from '../write-user-rules';

const { mockGetCursorUserSettingsPath, mockPathExists, mockReadFile, mockMkdir, mockWriteFile } = vi.hoisted(() => ({
    mockGetCursorUserSettingsPath: vi.fn(),
    mockMkdir: vi.fn(),
    mockPathExists: vi.fn(),
    mockReadFile: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('../../cursor-config', () => ({
    getCursorUserSettingsPath: mockGetCursorUserSettingsPath,
}));

vi.mock('../../file-operations/path-exists', () => ({
    pathExists: mockPathExists,
}));

vi.mock('node:fs/promises', () => ({
    mkdir: mockMkdir,
    readFile: mockReadFile,
    writeFile: mockWriteFile,
}));

describe('writeUserRules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен создавать новый файл настроек с User Rules', async () => {
        const mockSettingsPath = '/Users/test/Library/Application Support/Cursor/User/settings.json';
        const mockSettingsDir = '/Users/test/Library/Application Support/Cursor/User';
        const rules: UserRule[] = [{ content: 'Test content 1', name: 'meta-info.md' }];

        mockGetCursorUserSettingsPath.mockResolvedValue(mockSettingsPath);
        mockPathExists.mockResolvedValue(false);

        await writeUserRules(rules);

        expect(mockMkdir).toHaveBeenCalledWith(mockSettingsDir, { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(
            mockSettingsPath,
            expect.stringContaining('"cursor.userRules"'),
            'utf-8',
        );
        const writeCall = mockWriteFile.mock.calls[0];
        const writtenContent = JSON.parse(writeCall[1] as string);
        expect(writtenContent['cursor.userRules']).toEqual(rules);
    });

    it('должен обновлять существующий файл настроек с сохранением других настроек', async () => {
        const mockSettingsPath = '/Users/test/Library/Application Support/Cursor/User/settings.json';
        const mockSettingsDir = '/Users/test/Library/Application Support/Cursor/User';
        const existingSettings = {
            'editor.fontSize': 14,
            'editor.tabSize': 4,
        };
        const rules: UserRule[] = [{ content: 'Test content 1', name: 'meta-info.md' }];

        mockGetCursorUserSettingsPath.mockResolvedValue(mockSettingsPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(existingSettings));

        await writeUserRules(rules);

        expect(mockReadFile).toHaveBeenCalledWith(mockSettingsPath, 'utf-8');
        expect(mockMkdir).toHaveBeenCalledWith(mockSettingsDir, { recursive: true });
        const writeCall = mockWriteFile.mock.calls[0];
        const writtenContent = JSON.parse(writeCall[1] as string);
        expect(writtenContent['cursor.userRules']).toEqual(rules);
        expect(writtenContent['editor.fontSize']).toBe(14);
        expect(writtenContent['editor.tabSize']).toBe(4);
    });

    it('должен выбрасывать ошибку если rules не переданы', async () => {
        await expect(writeUserRules(null as unknown as UserRule[])).rejects.toThrow('rules is required');
        await expect(writeUserRules(undefined as unknown as UserRule[])).rejects.toThrow('rules is required');
    });

    it('должен обрабатывать ошибку чтения существующего файла', async () => {
        const mockSettingsPath = '/Users/test/Library/Application Support/Cursor/User/settings.json';
        const mockSettingsDir = '/Users/test/Library/Application Support/Cursor/User';
        const rules: UserRule[] = [{ content: 'Test content 1', name: 'meta-info.md' }];

        mockGetCursorUserSettingsPath.mockResolvedValue(mockSettingsPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockRejectedValue(new Error('Read error'));

        await writeUserRules(rules);

        expect(mockMkdir).toHaveBeenCalledWith(mockSettingsDir, { recursive: true });
        const writeCall = mockWriteFile.mock.calls[0];
        const writtenContent = JSON.parse(writeCall[1] as string);
        expect(writtenContent['cursor.userRules']).toEqual(rules);
    });
});
