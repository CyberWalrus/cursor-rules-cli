import { describe, expect, it } from 'vitest';

import { shouldIgnoreFile } from '../should-ignore-file';

describe('shouldIgnoreFile', () => {
    it('должен возвращать false если ignoreList пуст', () => {
        const result = shouldIgnoreFile('rules/file.mdc', []);

        expect(result).toBe(false);
    });

    it('должен возвращать true для точного совпадения пути', () => {
        const result = shouldIgnoreFile('rules/custom.mdc', ['rules/custom.mdc']);

        expect(result).toBe(true);
    });

    it('должен возвращать false если путь не совпадает', () => {
        const result = shouldIgnoreFile('rules/file.mdc', ['rules/custom.mdc']);

        expect(result).toBe(false);
    });

    it('должен поддерживать glob patterns с звездочкой', () => {
        const result = shouldIgnoreFile('rules/custom-file.mdc', ['rules/custom-*.mdc']);

        expect(result).toBe(true);
    });

    it('должен поддерживать glob patterns с двойной звездочкой', () => {
        const result = shouldIgnoreFile('rules/subdir/file.mdc', ['rules/**/*.mdc']);

        expect(result).toBe(true);
    });

    it('должен поддерживать несколько паттернов', () => {
        const result1 = shouldIgnoreFile('rules/file1.mdc', ['rules/file1.mdc', 'rules/file2.mdc']);

        expect(result1).toBe(true);

        const result2 = shouldIgnoreFile('rules/file3.mdc', ['rules/file1.mdc', 'rules/file2.mdc']);

        expect(result2).toBe(false);
    });

    it('должен нормализовать пути для кроссплатформенной совместимости', () => {
        const result = shouldIgnoreFile('rules\\subdir\\file.mdc', ['rules/subdir/file.mdc']);

        expect(result).toBe(true);
    });

    it('должен поддерживать паттерны с расширениями', () => {
        const result = shouldIgnoreFile('rules/file.backup.mdc', ['**/*.backup.*']);

        expect(result).toBe(true);
    });

    it('должен поддерживать отрицательные паттерны - игнорировать rules/** но не rules/prompt-workflow.mdc', () => {
        const result1 = shouldIgnoreFile('rules/prompt-workflow.mdc', ['rules/**', '!rules/prompt-workflow.mdc']);

        expect(result1).toBe(false);

        const result2 = shouldIgnoreFile('rules/other-file.mdc', ['rules/**', '!rules/prompt-workflow.mdc']);

        expect(result2).toBe(true);
    });

    it('должен поддерживать отрицательные паттерны для поддиректорий', () => {
        const result1 = shouldIgnoreFile('rules/subdir/file.mdc', ['rules/**', '!rules/subdir/**']);

        expect(result1).toBe(false);

        const result2 = shouldIgnoreFile('rules/other-dir/file.mdc', ['rules/**', '!rules/subdir/**']);

        expect(result2).toBe(true);
    });

    it('должен поддерживать несколько отрицательных паттернов', () => {
        const result1 = shouldIgnoreFile('rules/prompt-workflow.mdc', [
            'rules/**',
            '!rules/prompt-workflow.mdc',
            '!rules/another-file.mdc',
        ]);

        expect(result1).toBe(false);

        const result2 = shouldIgnoreFile('rules/another-file.mdc', [
            'rules/**',
            '!rules/prompt-workflow.mdc',
            '!rules/another-file.mdc',
        ]);

        expect(result2).toBe(false);

        const result3 = shouldIgnoreFile('rules/third-file.mdc', [
            'rules/**',
            '!rules/prompt-workflow.mdc',
            '!rules/another-file.mdc',
        ]);

        expect(result3).toBe(true);
    });

    it('должен нормализовать Windows-пути в отрицательных паттернах', () => {
        const result1 = shouldIgnoreFile('rules\\prompt-workflow.mdc', ['rules/**', '!rules/prompt-workflow.mdc']);

        expect(result1).toBe(false);

        const result2 = shouldIgnoreFile('rules\\other-file.mdc', ['rules/**', '!rules/prompt-workflow.mdc']);

        expect(result2).toBe(true);
    });

    it('должен нормализовать Windows-пути в паттернах ignoreList', () => {
        const result1 = shouldIgnoreFile('rules/prompt-workflow.mdc', ['rules\\**', '!rules\\prompt-workflow.mdc']);

        expect(result1).toBe(false);

        const result2 = shouldIgnoreFile('rules/other-file.mdc', ['rules\\**', '!rules\\prompt-workflow.mdc']);

        expect(result2).toBe(true);
    });

    it('должен нормализовать Windows-пути в отрицательных паттернах для поддиректорий', () => {
        const result1 = shouldIgnoreFile('rules\\subdir\\file.mdc', ['rules/**', '!rules/subdir/**']);

        expect(result1).toBe(false);

        const result2 = shouldIgnoreFile('rules/subdir/file.mdc', ['rules\\**', '!rules\\subdir\\**']);

        expect(result2).toBe(false);

        const result3 = shouldIgnoreFile('rules\\other-dir\\file.mdc', ['rules/**', '!rules/subdir/**']);

        expect(result3).toBe(true);
    });
});
