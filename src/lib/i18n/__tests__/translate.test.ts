import { initI18n, resetI18n, t } from '../translate';

const { mockDetectLanguage } = vi.hoisted(() => ({
    mockDetectLanguage: vi.fn(),
}));

vi.mock('../detect-language', () => ({
    detectLanguage: mockDetectLanguage,
}));

describe('translate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetI18n();
    });

    it('должен инициализировать систему локализации', async () => {
        mockDetectLanguage.mockResolvedValue('ru');

        await initI18n();

        expect(mockDetectLanguage).toHaveBeenCalled();
        expect(t('cli.main.init.success')).toBe('✅ Правила успешно инициализированы');
    });

    it('должен использовать английский по умолчанию если не инициализирован', () => {
        const result = t('cli.main.init.success');

        expect(result).toBe('✅ Rules initialized successfully');
    });

    it('должен выполнять подстановку параметров', async () => {
        mockDetectLanguage.mockResolvedValue('en');

        await initI18n();

        const result = t('command.init.success', { version: '1.0.0' });

        expect(result).toBe('✓ Initialized prompts version 1.0.0');
    });

    it('должен выполнять подстановку нескольких параметров', async () => {
        mockDetectLanguage.mockResolvedValue('en');

        await initI18n();

        const result = t('command.upgrade.success', { current: '1.0.0', latest: '2.0.0' });

        expect(result).toBe('✓ Upgraded from 1.0.0 to 2.0.0');
    });

    it('должен возвращать ключ если перевод не найден', async () => {
        mockDetectLanguage.mockResolvedValue('en');

        await initI18n();

        const result = t('unknown.key' as never);

        expect(result).toBe('unknown.key');
    });

    it('должен использовать английский при неизвестном языке', async () => {
        mockDetectLanguage.mockResolvedValue('fr' as 'en' | 'ru');

        await initI18n();

        const result = t('cli.main.init.success');

        expect(result).toBe('✅ Rules initialized successfully');
    });

    it('должен обрабатывать ошибку при детекции языка', async () => {
        mockDetectLanguage.mockRejectedValue(new Error('Network error'));

        await expect(initI18n()).rejects.toThrow('Network error');
    });

    it.each([
        { description: 'null', value: null },
        { description: 'undefined', value: undefined },
    ])('должен обрабатывать $description в параметрах', async ({ value }) => {
        mockDetectLanguage.mockResolvedValue('en');

        await initI18n();

        const result = t('command.init.success', { version: value as unknown as string });

        expect(typeof result).toBe('string');
        expect(result).toContain(String(value));
    });

    it('должен обрабатывать отсутствие параметров для строки с подстановкой', async () => {
        mockDetectLanguage.mockResolvedValue('en');

        await initI18n();

        const result = t('command.init.success');

        expect(typeof result).toBe('string');
        expect(result).toContain('{version}');
    });
});
