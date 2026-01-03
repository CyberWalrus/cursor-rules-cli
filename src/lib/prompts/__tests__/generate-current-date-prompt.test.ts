import { generateCurrentDatePrompt } from '../generate-current-date-prompt';

const mockGetSystemRulesFile = vi.hoisted(() => vi.fn());

vi.mock('../../system-rules-cache', () => ({
    getSystemRulesFile: mockGetSystemRulesFile,
}));

describe('generateCurrentDatePrompt', () => {
    const template = `---
id: current-date
type: compact
alwaysApply: true
current_date: "\${CURRENT_DATE}"
---

# Current Date Context

<current_date_context>

**MANDATORY - ZERO TOLERANCE:** The date specified below is the ONLY source of truth for current time. You MUST use it for ALL temporal reasoning, information searches, and time-sensitive operations.

**CURRENT DATE:** \${CURRENT_DATE}

</current_date_context>
`;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetSystemRulesFile.mockResolvedValue(template);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('должен генерировать промпт с текущей датой', async () => {
        const testDate = new Date('2025-01-15T10:00:00Z');
        vi.setSystemTime(testDate);

        const result = await generateCurrentDatePrompt();

        expect(mockGetSystemRulesFile).toHaveBeenCalledWith('current-date.template.md', false);
        expect(result).toContain('current_date: "2025-1-15"');
        expect(result).toContain('**CURRENT DATE:** 2025-1-15');
        expect(result).not.toMatch(/\$\{CURRENT_DATE\}/);
    });

    it('должен форматировать дату в формате YYYY-M-D', async () => {
        const testDate = new Date('2025-12-25T10:00:00Z');
        vi.setSystemTime(testDate);

        const result = await generateCurrentDatePrompt();

        expect(result).toContain('2025-12-25');
    });
});
