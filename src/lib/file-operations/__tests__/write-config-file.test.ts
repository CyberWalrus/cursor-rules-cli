import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { RulesConfig } from '../../../model';
import { writeConfigFile } from '../write-config-file';

function getTestPath(...segments: string[]): string {
    return join(tmpdir(), 'cursor-rules-test', ...segments);
}

const { mockMkdir, mockWriteFile } = vi.hoisted(() => ({
    mockMkdir: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
}));

describe('writeConfigFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен записывать файл конфигурации с правильным форматированием', async () => {
        const config: RulesConfig = {
            configVersion: '1.0.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        const targetDir = getTestPath('target');

        await writeConfigFile(targetDir, config);

        expect(mockMkdir).toHaveBeenCalledWith(join(targetDir, '.cursor'), { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(
            join(targetDir, '.cursor', 'cursor-rules-config.json'),
            JSON.stringify(config, null, 2),
            'utf-8',
        );
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        const config: RulesConfig = {
            configVersion: '1.0.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        await expect(writeConfigFile('', config)).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если config null', async () => {
        const targetDir = getTestPath('target');

        await expect(writeConfigFile(targetDir, null as unknown as RulesConfig)).rejects.toThrow('config is required');
    });

    it('должен выбрасывать ошибку если config undefined', async () => {
        const targetDir = getTestPath('target');

        await expect(writeConfigFile(targetDir, undefined as unknown as RulesConfig)).rejects.toThrow(
            'config is required',
        );
    });

    it('должен обрабатывать ошибки записи файла', async () => {
        const config: RulesConfig = {
            configVersion: '1.0.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockRejectedValue(new Error('Write failed'));

        const targetDir = getTestPath('target');

        await expect(writeConfigFile(targetDir, config)).rejects.toThrow('Failed to write config file');
    });
});
