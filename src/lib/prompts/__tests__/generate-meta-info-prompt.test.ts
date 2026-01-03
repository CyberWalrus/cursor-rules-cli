import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { UserMetaInfo } from '../../../model/types/main';
import { generateMetaInfoPrompt } from '../generate-meta-info-prompt';

vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
}));

vi.mock('../get-package-prompts-dir', () => ({
    getPackagePromptsDir: (packageDir: string) => join(packageDir, 'system-rules'),
}));

const mockReadFile = vi.mocked(readFile);

describe('generateMetaInfoPrompt', () => {
    const packageDir = '/test/package';
    const templatePath = join(packageDir, 'system-rules', 'meta-info.template.md');
    const template = `---
id: user-meta-info
type: compact
alwaysApply: true
---

# User Meta Info

<user_meta>

**SOURCE OF TRUTH:** Treat this context as authoritative; always prefer it over assumptions.

**User Profile:**

- Name: \${NAME}
- Age: \${AGE}
- Role: \${ROLE}

**Technical Environment:**

- Primary Stack: \${STACK}
- Tool Versions: \${TOOL_VERSIONS}
- Operating System: \${OS}
- Hardware: \${DEVICE}
- Environment: Cursor IDE (AI-first code editor, VS Code-based)

**Location & Communication:**

- Location: \${LOCATION}
- Language: \${LANGUAGE}
- Communication Style: \${COMMUNICATION_STYLE}

**ВАЖНО: Все ответы должны быть на русском языке.**

<completion_criteria>
Context internalized, tool versions verified.
</completion_criteria>

</user_meta>
`;

    beforeEach(() => {
        vi.clearAllMocks();
        mockReadFile.mockResolvedValue(template);
    });

    it('должен генерировать промпт с подстановкой значений', async () => {
        const metaInfo: UserMetaInfo = {
            age: 30,
            communicationStyle: 'Professional',
            device: 'MacBook Pro',
            language: 'Russian',
            location: 'Moscow',
            name: 'Test User',
            os: 'macOS',
            role: 'Developer',
            stack: 'TypeScript, React',
            toolVersions: 'Node.js v20',
        };

        const result = await generateMetaInfoPrompt(packageDir, metaInfo);

        expect(mockReadFile).toHaveBeenCalledWith(templatePath, 'utf-8');
        expect(result).toContain('Name: Test User');
        expect(result).toContain('Age: 30');
        expect(result).toContain('Role: Developer');
        expect(result).toContain('Primary Stack: TypeScript, React');
        expect(result).toContain('Tool Versions: Node.js v20');
        expect(result).toContain('Operating System: macOS');
        expect(result).toContain('Hardware: MacBook Pro');
        expect(result).toContain('Location: Moscow');
        expect(result).toContain('Language: Russian');
        expect(result).toContain('Communication Style: Professional');
    });

    it('должен генерировать промпт с пустыми значениями если metaInfo не передан', async () => {
        const result = await generateMetaInfoPrompt(packageDir, null);

        expect(result).toContain('Name: ');
        expect(result).toContain('Age: ');
        expect(result).toContain('Role: ');
    });

    it('должен генерировать промпт с пустыми значениями если metaInfo undefined', async () => {
        const result = await generateMetaInfoPrompt(packageDir, undefined);

        expect(result).toContain('Name: ');
        expect(result).toContain('Age: ');
    });

    it('должен генерировать промпт с частичными значениями', async () => {
        const metaInfo: UserMetaInfo = {
            name: 'Test User',
            role: 'Developer',
        };

        const result = await generateMetaInfoPrompt(packageDir, metaInfo);

        expect(result).toContain('Name: Test User');
        expect(result).toContain('Age: ');
        expect(result).toContain('Role: Developer');
    });
});
