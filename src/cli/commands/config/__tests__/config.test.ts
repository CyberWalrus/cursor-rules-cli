import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configCommand } from '../index';

const mockSelect = vi.hoisted(() => vi.fn());
const mockCancel = vi.hoisted(() => vi.fn());
const mockIsCancel = vi.hoisted(() => vi.fn());
const mockReadUserConfig = vi.hoisted(() => vi.fn());
const mockWriteUserConfig = vi.hoisted(() => vi.fn());
const mockT = vi.hoisted(() =>
    vi.fn((key: string, params?: Record<string, string>) => {
        const translations: Record<string, string> = {
            'cli.interactive-menu.cancelled': 'Операция отменена',
            'command.config.language.en': 'English',
            'command.config.language.ru': 'Русский',
            'command.config.select-language': 'Выберите язык интерфейса:',
            'command.config.success': `✓ Язык интерфейса установлен: ${params?.language ?? ''}`,
        };

        return translations[key] ?? key;
    }),
);

vi.mock('@clack/prompts', () => ({
    cancel: mockCancel,
    isCancel: mockIsCancel,
    select: mockSelect,
}));

vi.mock('../../../../lib/user-config', () => ({
    readUserConfig: mockReadUserConfig,
    writeUserConfig: mockWriteUserConfig,
}));

vi.mock('../../../../lib/i18n', () => ({
    t: mockT,
}));

describe('configCommand', () => {
    const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    beforeEach(() => {
        vi.clearAllMocks();
        mockIsCancel.mockReturnValue(false);
        mockCancel.mockImplementation(() => {});
        mockConsoleLog.mockClear();
    });

    it('должен сохранять выбранный язык', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        mockSelect.mockResolvedValue('ru');
        mockWriteUserConfig.mockResolvedValue(undefined);

        await configCommand();

        expect(mockReadUserConfig).toHaveBeenCalledTimes(1);
        expect(mockSelect).toHaveBeenCalledWith({
            initialValue: 'en',
            message: expect.any(String),
            options: [
                { label: expect.any(String), value: 'en' },
                { label: expect.any(String), value: 'ru' },
            ],
        });
        expect(mockWriteUserConfig).toHaveBeenCalledWith({
            language: 'ru',
        });
    });

    it('должен использовать текущий язык из конфига как initialValue', async () => {
        mockReadUserConfig.mockResolvedValue({ language: 'ru' });
        mockSelect.mockResolvedValue('en');
        mockWriteUserConfig.mockResolvedValue(undefined);

        await configCommand();

        expect(mockSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                initialValue: 'ru',
            }),
        );
    });

    it('должен сохранять существующие поля конфига при обновлении языка', async () => {
        const existingConfig = {
            customField: 'value',
            language: 'en' as const,
        };
        mockReadUserConfig.mockResolvedValue(existingConfig);
        mockSelect.mockResolvedValue('ru');
        mockWriteUserConfig.mockResolvedValue(undefined);

        await configCommand();

        expect(mockWriteUserConfig).toHaveBeenCalledWith({
            ...existingConfig,
            language: 'ru',
        });
    });

    it('должен отменять операцию если пользователь отменил выбор', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        mockIsCancel.mockReturnValue(true);
        mockSelect.mockResolvedValue(null);

        await configCommand();

        expect(mockCancel).toHaveBeenCalledTimes(1);
        expect(mockWriteUserConfig).not.toHaveBeenCalled();
    });

    it('должен использовать en как язык по умолчанию если конфиг отсутствует', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        mockSelect.mockResolvedValue('en');
        mockWriteUserConfig.mockResolvedValue(undefined);

        await configCommand();

        expect(mockSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                initialValue: 'en',
            }),
        );
    });
});
