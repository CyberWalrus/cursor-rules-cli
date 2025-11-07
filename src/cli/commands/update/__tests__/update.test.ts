import { beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateDiff } from '../../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget, readConfigFile, writeConfigFile } from '../../../../lib/file-operations';
import { compareVersions } from '../../../../lib/version-manager/compare-versions';
import { getCurrentVersion } from '../../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { updateCommand } from '../index';

vi.mock('../../../../lib/diff-calculator/calculate-diff');
vi.mock('../../../../lib/file-operations');
vi.mock('../../../../lib/version-manager/compare-versions');
vi.mock('../../../../lib/version-manager/get-current-version');
vi.mock('../../../../lib/version-manager/get-package-version');

const mockGetCurrentVersion = vi.mocked(getCurrentVersion);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockCompareVersions = vi.mocked(compareVersions);
const mockCalculateDiff = vi.mocked(calculateDiff);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockReadConfigFile = vi.mocked(readConfigFile);
const mockWriteConfigFile = vi.mocked(writeConfigFile);

describe('updateCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен успешно обновлять правила при наличии diff', async () => {
        const config = {
            configVersion: '1.0.0',
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

        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.1.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'minor',
            current: '1.0.0',
            target: '1.1.0',
        });
        mockReadConfigFile.mockResolvedValue(config);
        mockCalculateDiff.mockResolvedValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockGetCurrentVersion).toHaveBeenCalledWith('/target/dir');
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockCompareVersions).toHaveBeenCalledWith('1.0.0', '1.1.0');
        expect(mockReadConfigFile).toHaveBeenCalledWith('/target/dir');
        expect(mockCalculateDiff).toHaveBeenCalledWith('/package/dir', '/target/dir');
        expect(mockCopyRulesToTarget).toHaveBeenCalledWith('/package/dir', '/target/dir', [], []);
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку если packageDir не указан', async () => {
        await expect(updateCommand('', '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', async () => {
        await expect(updateCommand(null as unknown as string, '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если targetDir не указан', async () => {
        await expect(updateCommand('/package/dir', '')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir null', async () => {
        await expect(updateCommand('/package/dir', null as unknown as string)).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если правила не инициализированы', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);

        await expect(updateCommand('/package/dir', '/target/dir')).rejects.toThrow(
            'Rules not initialized. Run init command first.',
        );
    });

    it('должен пропускать обновление если версии одинаковые', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'none',
            current: '1.0.0',
            target: '1.0.0',
        });

        await updateCommand('/package/dir', '/target/dir');

        expect(mockGetCurrentVersion).toHaveBeenCalledWith('/target/dir');
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockCompareVersions).toHaveBeenCalledWith('1.0.0', '1.0.0');
        expect(mockCalculateDiff).not.toHaveBeenCalled();
        expect(mockCopyRulesToTarget).not.toHaveBeenCalled();
        expect(mockWriteConfigFile).not.toHaveBeenCalled();
    });

    it('должен пропускать обновление если нет ruleSets с update: true', async () => {
        const config = {
            configVersion: '1.0.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [
                {
                    id: 'base',
                    update: false,
                },
            ],
            settings: {
                language: 'ru' as const,
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.1.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'minor',
            current: '1.0.0',
            target: '1.1.0',
        });
        mockReadConfigFile.mockResolvedValue(config);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockCalculateDiff).not.toHaveBeenCalled();
        expect(mockCopyRulesToTarget).not.toHaveBeenCalled();
        expect(mockWriteConfigFile).not.toHaveBeenCalled();
    });

    it('должен вызывать calculateDiff для вычисления изменений', async () => {
        const config = {
            configVersion: '1.0.0',
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

        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'major',
            current: '1.0.0',
            target: '2.0.0',
        });
        mockReadConfigFile.mockResolvedValue(config);
        mockCalculateDiff.mockResolvedValue({
            toAdd: ['.cursor/new'],
            toDelete: ['.cursor/old'],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockCalculateDiff).toHaveBeenCalledTimes(1);
        expect(mockCalculateDiff).toHaveBeenCalledWith('/package/dir', '/target/dir');
    });

    it('должен обновлять версию через writeConfigFile', async () => {
        const config = {
            configVersion: '1.0.0',
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

        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.2.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'minor',
            current: '1.0.0',
            target: '1.2.0',
        });
        mockReadConfigFile.mockResolvedValue(config);
        mockCalculateDiff.mockResolvedValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockWriteConfigFile).toHaveBeenCalledTimes(1);
        expect(mockWriteConfigFile).toHaveBeenCalledWith('/target/dir', {
            ...config,
            updatedAt: expect.any(String),
            version: '1.2.0',
        });
    });

    it('должен обрабатывать patch обновления', async () => {
        const config = {
            configVersion: '1.0.0',
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

        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.0.1');
        mockCompareVersions.mockReturnValue({
            changeType: 'patch',
            current: '1.0.0',
            target: '1.0.1',
        });
        mockReadConfigFile.mockResolvedValue(config);
        mockCalculateDiff.mockResolvedValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockCompareVersions).toHaveBeenCalledWith('1.0.0', '1.0.1');
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });
});
