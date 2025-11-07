import { join } from 'node:path';

import type { RulesConfig } from '../../../model';
import { copyRulesToTarget, deleteRulesFromTarget, readConfigFile, writeConfigFile } from '../index';

const { mockCp, mockAccess, mockMkdir, mockReadFile, mockRm, mockWriteFile, mockPathExists, mockReaddir } = vi.hoisted(
    () => ({
        mockAccess: vi.fn(),
        mockCp: vi.fn(),
        mockMkdir: vi.fn(),
        mockPathExists: vi.fn(),
        mockReadFile: vi.fn(),
        mockReaddir: vi.fn(),
        mockRm: vi.fn(),
        mockWriteFile: vi.fn(),
    }),
);

vi.mock('node:fs/promises', () => ({
    access: mockAccess,
    constants: { F_OK: 0 },
    cp: mockCp,
    mkdir: mockMkdir,
    readFile: mockReadFile,
    readdir: mockReaddir,
    rm: mockRm,
    writeFile: mockWriteFile,
}));

vi.mock('../path-exists', () => ({
    pathExists: mockPathExists,
}));

vi.mock('../apply-yaml-overrides', () => ({
    applyYamlOverrides: vi.fn(),
}));

vi.mock('../should-ignore-file', () => ({
    shouldIgnoreFile: vi.fn(() => false),
}));

describe('file-operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('copyRulesToTarget', () => {
        it('должен копировать существующие директории правил', async () => {
            mockPathExists.mockResolvedValue(true);
            mockReaddir.mockResolvedValue([{ isDirectory: () => false, isFile: () => true, name: 'file1.mdc' }]);
            mockMkdir.mockResolvedValue(undefined);
            mockCp.mockResolvedValue(undefined);

            await copyRulesToTarget('/package', '/target');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReaddir).toHaveBeenCalled();
        });

        it('должен пропускать несуществующие директории', async () => {
            mockPathExists.mockResolvedValue(false);

            await copyRulesToTarget('/package', '/target');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReaddir).not.toHaveBeenCalled();
        });
    });

    describe('deleteRulesFromTarget', () => {
        it('должен удалять существующие директории правил', async () => {
            mockPathExists.mockResolvedValue(true);
            mockRm.mockResolvedValue(undefined);

            await deleteRulesFromTarget('/target');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockRm).toHaveBeenCalled();
        });

        it('должен пропускать несуществующие директории', async () => {
            mockPathExists.mockResolvedValue(false);

            await deleteRulesFromTarget('/target');

            expect(mockPathExists).toHaveBeenCalled();
            expect(mockRm).not.toHaveBeenCalled();
        });
    });

    describe('readConfigFile', () => {
        it('должен читать и парсить файл конфигурации', async () => {
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

            mockPathExists.mockResolvedValue(true);
            mockReadFile.mockResolvedValue(JSON.stringify(config));

            const result = await readConfigFile('/target');

            expect(result).toEqual(config);
            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReadFile).toHaveBeenCalledWith(join('/target', '.cursor', 'cursor-rules-config.json'), 'utf-8');
        });

        it('должен возвращать null если файл не существует', async () => {
            mockPathExists.mockResolvedValue(false);

            const result = await readConfigFile('/target');

            expect(result).toBeNull();
            expect(mockPathExists).toHaveBeenCalled();
            expect(mockReadFile).not.toHaveBeenCalled();
        });
    });

    describe('writeConfigFile', () => {
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

            await writeConfigFile('/target', config);

            expect(mockMkdir).toHaveBeenCalledWith(join('/target', '.cursor'), { recursive: true });
            expect(mockWriteFile).toHaveBeenCalledWith(
                join('/target', '.cursor', 'cursor-rules-config.json'),
                JSON.stringify(config, null, 2),
                'utf-8',
            );
        });
    });
});
