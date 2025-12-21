import { getTranslations } from '../get-translations';

describe('getTranslations', () => {
    it('должен возвращать английские переводы для en', () => {
        const translations = getTranslations('en');

        expect(translations['cli.main.init.success']).toBe('✅ Rules initialized successfully');
        expect(translations['cli.interactive-menu.select-action']).toBe('Select action:');
    });

    it('должен возвращать русские переводы для ru', () => {
        const translations = getTranslations('ru');

        expect(translations['cli.main.init.success']).toBe('✅ Правила успешно инициализированы');
        expect(translations['cli.interactive-menu.select-action']).toBe('Выберите действие:');
    });
});
