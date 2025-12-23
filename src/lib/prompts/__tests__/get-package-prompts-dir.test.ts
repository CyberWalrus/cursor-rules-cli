import { join } from 'node:path';

import { getPackagePromptsDir } from '../get-package-prompts-dir';

describe('getPackagePromptsDir', () => {
    it('должен возвращать путь к user-rules директории', () => {
        const packageDir = '/test/package';
        const expected = join(packageDir, 'user-rules');

        const result = getPackagePromptsDir(packageDir);

        expect(result).toBe(expected);
    });

    it('должен выбрасывать ошибку если packageDir пустой', () => {
        expect(() => getPackagePromptsDir('')).toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', () => {
        expect(() => getPackagePromptsDir(null as never)).toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir undefined', () => {
        expect(() => getPackagePromptsDir(undefined as never)).toThrow('packageDir is required');
    });
});
