import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCursorUserSettingsPath } from '../get-cursor-user-settings-path';

const { mockGetCursorConfigDir } = vi.hoisted(() => ({
    mockGetCursorConfigDir: vi.fn(),
}));

vi.mock('../get-cursor-config-dir', () => ({
    getCursorConfigDir: mockGetCursorConfigDir,
}));

describe('getCursorUserSettingsPath', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен возвращать путь к файлу настроек пользователя', async () => {
        const mockConfigDir = '/Users/test/Library/Application Support/Cursor';

        mockGetCursorConfigDir.mockResolvedValue(mockConfigDir);

        const result = await getCursorUserSettingsPath();

        expect(result).toBe(join(mockConfigDir, 'User', 'settings.json'));
        expect(mockGetCursorConfigDir).toHaveBeenCalledOnce();
    });
});
