import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserRule } from '../../../model/types/main';
import { readUserRules } from '../read-user-rules';

const { mockGetCursorUserSettingsPath, mockPathExists, mockReadFile } = vi.hoisted(() => ({
    mockGetCursorUserSettingsPath: vi.fn(),
    mockPathExists: vi.fn(),
    mockReadFile: vi.fn(),
}));

vi.mock('../../cursor-config', () => ({
    getCursorUserSettingsPath: mockGetCursorUserSettingsPath,
}));

vi.mock('../../file-operations/path-exists', () => ({
    pathExists: mockPathExists,
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
}));

describe('readUserRules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен читать User Rules из настроек Cursor', async () => {
        const mockSettingsPath = '/Users/test/Library/Application Support/Cursor/User/settings.json';
        const mockRules: UserRule[] = [
            { content: 'Test content 1', name: 'meta-info.md' },
            { content: 'Test content 2', name: 'core-system-instructions.md' },
        ];
        const mockSettings = {
            'cursor.userRules': mockRules,
            'editor.fontSize': 14,
        };

        mockGetCursorUserSettingsPath.mockResolvedValue(mockSettingsPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(mockSettings));

        const result = await readUserRules();

        expect(result).toEqual(mockRules);
        expect(mockReadFile).toHaveBeenCalledWith(mockSettingsPath, 'utf-8');
    });

    it('должен возвращать null если файл не существует', async () => {
        const mockSettingsPath = '/Users/test/Library/Application Support/Cursor/User/settings.json';

        mockGetCursorUserSettingsPath.mockResolvedValue(mockSettingsPath);
        mockPathExists.mockResolvedValue(false);

        const result = await readUserRules();

        expect(result).toBeNull();
        expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('должен возвращать null если поле cursor.userRules отсутствует', async () => {
        const mockSettingsPath = '/Users/test/Library/Application Support/Cursor/User/settings.json';
        const mockSettings = {
            'editor.fontSize': 14,
        };

        mockGetCursorUserSettingsPath.mockResolvedValue(mockSettingsPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(mockSettings));

        const result = await readUserRules();

        expect(result).toBeNull();
    });

    it('должен возвращать null если JSON некорректный', async () => {
        const mockSettingsPath = '/Users/test/Library/Application Support/Cursor/User/settings.json';

        mockGetCursorUserSettingsPath.mockResolvedValue(mockSettingsPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue('invalid json');

        const result = await readUserRules();

        expect(result).toBeNull();
    });

    it('должен возвращать null если файл не является объектом', async () => {
        const mockSettingsPath = '/Users/test/Library/Application Support/Cursor/User/settings.json';

        mockGetCursorUserSettingsPath.mockResolvedValue(mockSettingsPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue('"string"');

        const result = await readUserRules();

        expect(result).toBeNull();
    });
});
