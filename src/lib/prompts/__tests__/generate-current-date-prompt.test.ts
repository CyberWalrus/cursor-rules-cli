import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { generateCurrentDatePrompt } from '../generate-current-date-prompt';

vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
}));

vi.mock('../get-package-prompts-dir', () => ({
    getPackagePromptsDir: (packageDir: string) => join(packageDir, 'user-rules'),
}));

const mockReadFile = vi.mocked(readFile);

describe('generateCurrentDatePrompt', () => {
    const packageDir = '/test/package';
    const templatePath = join(packageDir, 'user-rules', 'current-date.template.md');
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
        mockReadFile.mockResolvedValue(template);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('должен генерировать промпт с текущей датой', async () => {
        const testDate = new Date('2025-01-15T10:00:00Z');
        vi.setSystemTime(testDate);

        const result = await generateCurrentDatePrompt(packageDir);

        expect(mockReadFile).toHaveBeenCalledWith(templatePath, 'utf-8');
        expect(result).toContain('current_date: "2025-1-15"');
        expect(result).toContain('**CURRENT DATE:** 2025-1-15');
        expect(result).not.toContain('${CURRENT_DATE}'); // eslint-disable-line no-template-curly-in-string
    });

    it('должен форматировать дату в формате YYYY-M-D', async () => {
        const testDate = new Date('2025-12-25T10:00:00Z');
        vi.setSystemTime(testDate);

        const result = await generateCurrentDatePrompt(packageDir);

        expect(result).toContain('2025-12-25');
    });
});
