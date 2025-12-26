import { removeYamlFrontmatter } from '../remove-yaml-frontmatter';

describe('removeYamlFrontmatter', () => {
    it('должен удалять YAML frontmatter из текста', () => {
        const text = `---
id: test
type: compact
---

# Title

Content here`;

        const result = removeYamlFrontmatter(text);

        expect(result).toBe(`# Title

Content here`);
    });

    it('должен возвращать текст без изменений если нет YAML frontmatter', () => {
        const text = `# Title

Content here`;

        const result = removeYamlFrontmatter(text);

        expect(result).toBe(text);
    });

    it('должен возвращать текст без изменений если есть --- но не в начале', () => {
        const text = `# Title

Some text with --- separator

More content`;

        const result = removeYamlFrontmatter(text);

        expect(result).toBe(text);
    });

    it('должен возвращать пустую строку если файл содержит только YAML frontmatter', () => {
        const text = `---
id: test
type: compact
---`;

        const result = removeYamlFrontmatter(text);

        expect(result).toBe('');
    });

    it('должен возвращать пустую строку для пустого файла', () => {
        const result = removeYamlFrontmatter('');

        expect(result).toBe('');
    });

    it('должен возвращать null для null', () => {
        const result = removeYamlFrontmatter(null as never);

        expect(result).toBeNull();
    });

    it('должен возвращать undefined для undefined', () => {
        const result = removeYamlFrontmatter(undefined as never);

        expect(result).toBeUndefined();
    });

    it('должен сохранять пробелы после frontmatter', () => {
        const text = `---
id: test
---

# Title

Content`;

        const result = removeYamlFrontmatter(text);

        expect(result).toBe(`# Title

Content`);
    });

    it('должен обрабатывать frontmatter с дополнительными пробелами', () => {
        const text = `---
id: test
type: compact
alwaysApply: true
---

# Title

Content`;

        const result = removeYamlFrontmatter(text);

        expect(result).toBe(`# Title

Content`);
    });

    it('должен возвращать текст без изменений если нет закрывающего ---', () => {
        const text = `---
id: test
type: compact

# Title

Content`;

        const result = removeYamlFrontmatter(text);

        expect(result).toBe(text);
    });
});
