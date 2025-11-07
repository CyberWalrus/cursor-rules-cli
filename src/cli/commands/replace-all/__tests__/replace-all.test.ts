import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    copyRulesToTarget,
    deleteRulesFromTarget,
    readConfigFile,
    writeConfigFile,
} from '../../../../lib/file-operations';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { replaceAllCommand } from '../index';

vi.mock('../../../../lib/file-operations');
vi.mock('../../../../lib/version-manager/get-package-version');

const mockDeleteRulesFromTarget = vi.mocked(deleteRulesFromTarget);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockReadConfigFile = vi.mocked(readConfigFile);
const mockWriteConfigFile = vi.mocked(writeConfigFile);

describe('replaceAllCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен успешно выполнять полную замену правил', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockDeleteRulesFromTarget).toHaveBeenCalledWith('/target/dir');
        expect(mockCopyRulesToTarget).toHaveBeenCalledWith('/package/dir', '/target/dir', [], []);
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });

    it('должен использовать существующий конфиг если он есть', async () => {
        const existingConfig = {
            configVersion: '1.0.0',
            fileOverrides: [],
            ignoreList: ['rules/custom.mdc'],
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru' as const,
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        mockReadConfigFile.mockResolvedValue(existingConfig);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockCopyRulesToTarget).toHaveBeenCalledWith('/package/dir', '/target/dir', ['rules/custom.mdc'], []);
        expect(mockWriteConfigFile).toHaveBeenCalledWith('/target/dir', {
            ...existingConfig,
            updatedAt: expect.any(String),
            version: '2.0.0',
        });
    });

    it('должен выбрасывать ошибку если packageDir не указан', async () => {
        await expect(replaceAllCommand('', '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', async () => {
        await expect(replaceAllCommand(null as unknown as string, '/target/dir')).rejects.toThrow(
            'packageDir is required',
        );
    });

    it('должен выбрасывать ошибку если targetDir не указан', async () => {
        await expect(replaceAllCommand('/package/dir', '')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir null', async () => {
        await expect(replaceAllCommand('/package/dir', null as unknown as string)).rejects.toThrow(
            'targetDir is required',
        );
    });

    it('должен вызывать deleteRulesFromTarget перед копированием', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockDeleteRulesFromTarget).toHaveBeenCalledTimes(1);
        expect(mockDeleteRulesFromTarget).toHaveBeenCalledWith('/target/dir');

        const deleteCallOrder = mockDeleteRulesFromTarget.mock.invocationCallOrder[0];
        const copyCallOrder = mockCopyRulesToTarget.mock.invocationCallOrder[0];
        expect(deleteCallOrder).toBeLessThan(copyCallOrder);
    });

    it('должен копировать правила через copyRulesToTarget', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockCopyRulesToTarget).toHaveBeenCalledTimes(1);
        expect(mockCopyRulesToTarget).toHaveBeenCalledWith('/package/dir', '/target/dir', [], []);
    });

    it('должен записывать новую конфигурацию через writeConfigFile', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('3.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockWriteConfigFile).toHaveBeenCalledTimes(1);
        expect(mockWriteConfigFile).toHaveBeenCalledWith('/target/dir', {
            configVersion: '1.0.0',
            fileOverrides: [],
            ignoreList: [],
            installedAt: expect.any(String),
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru' as const,
            },
            source: 'cursor-rules',
            updatedAt: expect.any(String),
            version: '3.0.0',
        });
    });

    it('должен записывать корректный ISO timestamp в installedAt и updatedAt', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        const beforeCall = new Date();
        await replaceAllCommand('/package/dir', '/target/dir');
        const afterCall = new Date();

        const callArgs = mockWriteConfigFile.mock.calls[0];
        const config = callArgs[1];
        const installedAt = new Date(config.installedAt);
        const updatedAt = new Date(config.updatedAt);

        expect(installedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(installedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(updatedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
});
