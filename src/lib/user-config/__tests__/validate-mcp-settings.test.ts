import type { McpSettings } from '../../../model/types/main';
import { validateMcpSettings } from '../validate-mcp-settings';

describe('validateMcpSettings', () => {
    it('должен возвращать isValid: false и все поля как missingFields если mcpSettings null', () => {
        const result = validateMcpSettings(null);

        expect(result.isValid).toBe(false);
        expect(result.missingFields).toEqual(['apiKey', 'aiModel']);
    });

    it('должен возвращать isValid: false и все поля как missingFields если mcpSettings undefined', () => {
        const result = validateMcpSettings(undefined);

        expect(result.isValid).toBe(false);
        expect(result.missingFields).toEqual(['apiKey', 'aiModel']);
    });

    it('должен возвращать isValid: false если apiKey отсутствует', () => {
        const mcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: '',
        };

        const result = validateMcpSettings(mcpSettings);

        expect(result.isValid).toBe(false);
        expect(result.missingFields).toEqual(['apiKey']);
    });

    it('должен возвращать isValid: false если aiModel отсутствует', () => {
        const mcpSettings: McpSettings = {
            aiModel: '',
            apiKey: 'test-key',
        };

        const result = validateMcpSettings(mcpSettings);

        expect(result.isValid).toBe(false);
        expect(result.missingFields).toEqual(['aiModel']);
    });

    it('должен возвращать isValid: false если оба поля отсутствуют', () => {
        const mcpSettings: McpSettings = {
            aiModel: '',
            apiKey: '',
        };

        const result = validateMcpSettings(mcpSettings);

        expect(result.isValid).toBe(false);
        expect(result.missingFields).toEqual(['apiKey', 'aiModel']);
    });

    it('должен возвращать isValid: true если все обязательные поля заполнены', () => {
        const mcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'test-key',
        };

        const result = validateMcpSettings(mcpSettings);

        expect(result.isValid).toBe(true);
        expect(result.missingFields).toEqual([]);
    });

    it('должен возвращать isValid: true если все обязательные поля заполнены и есть apiProviders', () => {
        const mcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'test-key',
            apiProviders: 'provider1,provider2',
        };

        const result = validateMcpSettings(mcpSettings);

        expect(result.isValid).toBe(true);
        expect(result.missingFields).toEqual([]);
    });

    it('должен возвращать isValid: false если apiKey null', () => {
        const mcpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: null,
        } as unknown as McpSettings;

        const result = validateMcpSettings(mcpSettings);

        expect(result.isValid).toBe(false);
        expect(result.missingFields).toEqual(['apiKey']);
    });

    it('должен возвращать isValid: false если aiModel null', () => {
        const mcpSettings = {
            aiModel: null,
            apiKey: 'test-key',
        } as unknown as McpSettings;

        const result = validateMcpSettings(mcpSettings);

        expect(result.isValid).toBe(false);
        expect(result.missingFields).toEqual(['aiModel']);
    });
});
