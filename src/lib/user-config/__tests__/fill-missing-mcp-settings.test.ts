import { cancel, isCancel, text } from '@clack/prompts';

import type { McpSettings } from '../../../model/types/main';
import { fillMissingMcpSettings } from '../fill-missing-mcp-settings';

vi.mock('@clack/prompts', () => ({
    cancel: vi.fn(),
    isCancel: vi.fn(),
    log: {
        info: vi.fn(),
        success: vi.fn(),
    },
    text: vi.fn(),
}));

vi.mock('../../i18n', () => ({
    t: (key: string) => key,
}));

vi.mock('../../i18n/get-translations', () => ({}));

describe('fillMissingMcpSettings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(isCancel).mockReturnValue(false);
    });

    it('должен заполнять apiKey если он отсутствует', async () => {
        const currentMcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: '',
        };

        vi.mocked(text).mockResolvedValue('new-api-key');

        const result = await fillMissingMcpSettings(currentMcpSettings, ['apiKey']);

        expect(result).toEqual({
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'new-api-key',
        });
        expect(text).toHaveBeenCalledTimes(1);
    });

    it('должен заполнять aiModel если он отсутствует', async () => {
        const currentMcpSettings: McpSettings = {
            aiModel: '',
            apiKey: 'test-key',
        };

        vi.mocked(text).mockResolvedValue('new-model');

        const result = await fillMissingMcpSettings(currentMcpSettings, ['aiModel']);

        expect(result).toEqual({
            aiModel: 'new-model',
            apiKey: 'test-key',
        });
        expect(text).toHaveBeenCalledTimes(1);
    });

    it('должен заполнять оба поля если они отсутствуют', async () => {
        const currentMcpSettings: McpSettings = {
            aiModel: '',
            apiKey: '',
        };

        vi.mocked(text).mockResolvedValueOnce('new-api-key').mockResolvedValueOnce('new-model');

        const result = await fillMissingMcpSettings(currentMcpSettings, ['apiKey', 'aiModel']);

        expect(result).toEqual({
            aiModel: 'new-model',
            apiKey: 'new-api-key',
        });
        expect(text).toHaveBeenCalledTimes(2);
    });

    it('должен использовать DEFAULT_AI_MODEL если aiModel пустой', async () => {
        const currentMcpSettings: McpSettings = {
            aiModel: '',
            apiKey: 'test-key',
        };

        vi.mocked(text).mockResolvedValue('');

        const result = await fillMissingMcpSettings(currentMcpSettings, ['aiModel']);

        expect(result).toEqual({
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'test-key',
        });
    });

    it('должен возвращать null если пользователь отменил ввод', async () => {
        const currentMcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: '',
        };

        const cancelSymbol = Symbol.for('clack.cancel');
        vi.mocked(text).mockResolvedValue(cancelSymbol as never);
        vi.mocked(isCancel).mockReturnValue(true);

        const result = await fillMissingMcpSettings(currentMcpSettings, ['apiKey']);

        expect(result).toBeNull();
        expect(cancel).toHaveBeenCalled();
    });

    it('должен создавать новый объект если currentMcpSettings null', async () => {
        vi.mocked(text).mockResolvedValue('new-api-key');

        const result = await fillMissingMcpSettings(null, ['apiKey']);

        expect(result).toEqual({
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'new-api-key',
        });
    });

    it('должен создавать новый объект если currentMcpSettings undefined', async () => {
        vi.mocked(text).mockResolvedValue('new-api-key');

        const result = await fillMissingMcpSettings(undefined, ['apiKey']);

        expect(result).toEqual({
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'new-api-key',
        });
    });

    it('должен использовать текущее значение как initialValue для apiKey', async () => {
        const currentMcpSettings: McpSettings = {
            aiModel: 'openai/gpt-oss-120b',
            apiKey: 'existing-key',
        };

        vi.mocked(text).mockResolvedValue('new-api-key');

        await fillMissingMcpSettings(currentMcpSettings, ['apiKey']);

        expect(text).toHaveBeenCalledWith(
            expect.objectContaining({
                initialValue: 'existing-key',
            }),
        );
    });

    it('должен использовать текущее значение как initialValue для aiModel', async () => {
        const currentMcpSettings: McpSettings = {
            aiModel: 'existing-model',
            apiKey: 'test-key',
        };

        vi.mocked(text).mockResolvedValue('new-model');

        await fillMissingMcpSettings(currentMcpSettings, ['aiModel']);

        expect(text).toHaveBeenCalledWith(
            expect.objectContaining({
                initialValue: 'existing-model',
            }),
        );
    });
});
