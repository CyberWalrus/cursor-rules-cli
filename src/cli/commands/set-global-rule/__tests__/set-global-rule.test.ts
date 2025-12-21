import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setGlobalRuleCommand } from '../index';

const { mockText, mockConfirm, mockIsCancel, mockCancel } = vi.hoisted(() => ({
    mockCancel: vi.fn(),
    mockConfirm: vi.fn(),
    mockIsCancel: vi.fn(),
    mockText: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
    cancel: mockCancel,
    confirm: mockConfirm,
    isCancel: mockIsCancel,
    text: mockText,
}));

const { mockReadUserRules, mockWriteUserRules, mockSubstituteTemplateVars, mockGetMetaInfoTemplatePath } = vi.hoisted(
    () => ({
        mockGetMetaInfoTemplatePath: vi.fn(),
        mockReadUserRules: vi.fn(),
        mockSubstituteTemplateVars: vi.fn(),
        mockWriteUserRules: vi.fn(),
    }),
);

vi.mock('../../../../lib/cursor-rules', () => ({
    getMetaInfoTemplatePath: mockGetMetaInfoTemplatePath,
    readUserRules: mockReadUserRules,
    substituteTemplateVars: mockSubstituteTemplateVars,
    writeUserRules: mockWriteUserRules,
}));

const { mockExtractVariablesFromContent } = vi.hoisted(() => ({
    mockExtractVariablesFromContent: vi.fn(),
}));

vi.mock('../extract-variables-from-content', () => ({
    extractVariablesFromContent: mockExtractVariablesFromContent,
}));

const { mockPromptVariables } = vi.hoisted(() => ({
    mockPromptVariables: vi.fn(),
}));

vi.mock('../prompt-variables', () => ({
    promptVariables: mockPromptVariables,
}));

describe('setGlobalRuleCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsCancel.mockReturnValue(false);
        mockGetMetaInfoTemplatePath.mockReturnValue('/template/path');
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('должен создавать новое правило если правил нет', async () => {
        const ruleName = 'meta-info.md';
        const variables = {
            CURRENT_DATE: '2025-12-02',
            NAME: 'Test User',
        };
        const substitutedContent = 'Substituted content';

        mockText.mockResolvedValue(ruleName);
        mockReadUserRules.mockResolvedValue(null);
        mockPromptVariables.mockResolvedValue(variables);
        mockSubstituteTemplateVars.mockResolvedValue(substitutedContent);
        mockWriteUserRules.mockResolvedValue(undefined);

        await setGlobalRuleCommand();

        expect(mockReadUserRules).toHaveBeenCalledOnce();
        expect(mockPromptVariables).toHaveBeenCalledWith({});
        expect(mockSubstituteTemplateVars).toHaveBeenCalledWith('/template/path', variables);
        expect(mockWriteUserRules).toHaveBeenCalledWith([{ content: substitutedContent, name: ruleName }]);
    });

    it('должен обновлять существующее правило', async () => {
        const ruleName = 'meta-info.md';
        const existingRules = [
            { content: 'Old content', name: ruleName },
            { content: 'Other content', name: 'other-rule.md' },
        ];
        const existingVariables = { NAME: 'Old Name' };
        const variables = {
            CURRENT_DATE: '2025-12-02',
            NAME: 'New Name',
        };
        const substitutedContent = 'New substituted content';

        mockText.mockResolvedValue(ruleName);
        mockReadUserRules.mockResolvedValue(existingRules);
        mockExtractVariablesFromContent.mockReturnValue(existingVariables);
        mockConfirm.mockResolvedValue(true);
        mockPromptVariables.mockResolvedValue(variables);
        mockSubstituteTemplateVars.mockResolvedValue(substitutedContent);
        mockWriteUserRules.mockResolvedValue(undefined);

        await setGlobalRuleCommand();

        expect(mockReadUserRules).toHaveBeenCalledOnce();
        expect(mockExtractVariablesFromContent).toHaveBeenCalledWith('Old content');
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockPromptVariables).toHaveBeenCalledWith(existingVariables);
        expect(mockWriteUserRules).toHaveBeenCalledWith([
            { content: substitutedContent, name: ruleName },
            { content: 'Other content', name: 'other-rule.md' },
        ]);
    });

    it('должен добавлять новое правило к существующим', async () => {
        const ruleName = 'new-rule.md';
        const existingRules = [{ content: 'Existing content', name: 'existing-rule.md' }];
        const variables = {
            CURRENT_DATE: '2025-12-02',
            NAME: 'Test User',
        };
        const substitutedContent = 'Substituted content';

        mockText.mockResolvedValue(ruleName);
        mockReadUserRules.mockResolvedValue(existingRules);
        mockPromptVariables.mockResolvedValue(variables);
        mockSubstituteTemplateVars.mockResolvedValue(substitutedContent);
        mockWriteUserRules.mockResolvedValue(undefined);

        await setGlobalRuleCommand();

        expect(mockWriteUserRules).toHaveBeenCalledWith([
            { content: 'Existing content', name: 'existing-rule.md' },
            { content: substitutedContent, name: ruleName },
        ]);
    });
});
