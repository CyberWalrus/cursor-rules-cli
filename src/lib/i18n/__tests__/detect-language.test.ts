import { detectLanguage } from '../detect-language';

const { mockReadUserConfig } = vi.hoisted(() => ({
    mockReadUserConfig: vi.fn(),
}));

vi.mock('../../user-config', () => ({
    readUserConfig: mockReadUserConfig,
}));

describe('detectLanguage', () => {
    const originalEnv = process.env;
    const originalIntl = global.Intl;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        global.Intl = originalIntl;
    });

    afterEach(() => {
        process.env = originalEnv;
        global.Intl = originalIntl;
    });

    it('должен возвращать язык из глобальной конфигурации', async () => {
        mockReadUserConfig.mockResolvedValue({
            language: 'ru',
        });

        const result = await detectLanguage();

        expect(result).toBe('ru');
    });

    it('должен возвращать язык из переменной окружения LANG', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        process.env.LANG = 'ru_RU.UTF-8';

        const result = await detectLanguage();

        expect(result).toBe('ru');
    });

    it('должен возвращать язык из переменной окружения LANGUAGE', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        delete process.env.LANG;
        process.env.LANGUAGE = 'en_US.UTF-8';

        const result = await detectLanguage();

        expect(result).toBe('en');
    });

    it('должен возвращать язык из переменной окружения LC_ALL', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        delete process.env.LANG;
        delete process.env.LANGUAGE;
        process.env.LC_ALL = 'ru_RU.UTF-8';

        const result = await detectLanguage();

        expect(result).toBe('ru');
    });

    it('должен возвращать язык из системной локали', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        delete process.env.LANG;
        delete process.env.LANGUAGE;
        delete process.env.LC_ALL;

        global.Intl = {
            DateTimeFormat: vi.fn().mockReturnValue({
                resolvedOptions: vi.fn().mockReturnValue({
                    locale: 'ru-RU',
                }),
            }),
        } as unknown as typeof Intl;

        const result = await detectLanguage();

        expect(result).toBe('ru');
    });

    it('должен возвращать en по умолчанию', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        delete process.env.LANG;
        delete process.env.LANGUAGE;
        delete process.env.LC_ALL;

        global.Intl = {
            DateTimeFormat: vi.fn().mockReturnValue({
                resolvedOptions: vi.fn().mockReturnValue({
                    locale: 'fr-FR',
                }),
            }),
        } as unknown as typeof Intl;

        const result = await detectLanguage();

        expect(result).toBe('en');
    });

    it('должен возвращать en при ошибке определения системной локали', async () => {
        mockReadUserConfig.mockResolvedValue(null);
        delete process.env.LANG;
        delete process.env.LANGUAGE;
        delete process.env.LC_ALL;

        global.Intl = {
            DateTimeFormat: vi.fn().mockImplementation(() => {
                throw new Error('Intl error');
            }),
        } as unknown as typeof Intl;

        const result = await detectLanguage();

        expect(result).toBe('en');
    });
});
